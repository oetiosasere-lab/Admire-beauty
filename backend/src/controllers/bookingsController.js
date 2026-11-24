const { supabase, isConfigured, mockStore } = require('../config/supabase');
const {
  generateBookingReference,
  calculateEndTime,
  isTimeOverlapping,
} = require('../services/bookingService');

/**
 * Submit a new appointment booking
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      service_id,
      appointment_date,
      start_time,
      full_name,
      email,
      phone,
      message,
    } = req.body;

    // Validate date format and ensure it's not in the past
    const targetDate = new Date(appointment_date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid appointment date format.' });
    }

    if (targetDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates.',
      });
    }

    const dayOfWeek = targetDate.getDay();

    let service = null;
    let dayAvail = null;
    let existingBookings = [];

    if (isConfigured && supabase) {
      // 1. Fetch service details
      const { data: srv, error: srvError } = await supabase
        .from('services')
        .select('*')
        .eq('id', service_id)
        .eq('is_active', true)
        .single();

      if (srvError || !srv) {
        return res.status(400).json({ success: false, message: 'Selected makeup service is unavailable.' });
      }
      service = srv;

      // 2. Check blocked dates
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('date', appointment_date)
        .maybeSingle();

      if (blocked) {
        return res.status(400).json({
          success: false,
          message: `The studio is closed on ${appointment_date} (${blocked.reason || 'Blocked'}).`,
        });
      }

      // 3. Check weekday availability
      const { data: avail } = await supabase
        .from('availability')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .maybeSingle();

      dayAvail = avail;
      if (!dayAvail || !dayAvail.is_available) {
        return res.status(400).json({
          success: false,
          message: 'The studio is closed on this day of the week.',
        });
      }

      // 4. Calculate appointment end time
      const endTime = calculateEndTime(start_time, service.duration);

      // 5. Query conflicting bookings on this date (Double-booking prevention)
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id, start_time, end_time, status')
        .eq('appointment_date', appointment_date)
        .neq('status', 'cancelled');

      const isConflict = (conflicts || []).some((b) =>
        isTimeOverlapping(start_time, endTime, b.start_time, b.end_time)
      );

      if (isConflict) {
        return res.status(409).json({
          success: false,
          message: 'This time slot was just reserved or overlaps with an existing appointment. Please select another slot.',
        });
      }

      // 6. Generate reference & insert booking
      const bookingRef = generateBookingReference();
      const customerId = req.user ? req.user.id : null;

      const { data: newBooking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          booking_reference: bookingRef,
          customer_id: customerId,
          service_id: service.id,
          full_name,
          email,
          phone,
          appointment_date,
          start_time,
          end_time: endTime,
          message: message || '',
          status: 'pending', // Pending owner approval
        })
        .select(`
          *,
          services (
            name,
            price,
            duration,
            image_url
          )
        `)
        .single();

      if (insertError) {
        // Unique constraint violation check
        if (insertError.code === '23505') {
          return res.status(409).json({
            success: false,
            message: 'Appointment slot is already booked. Please choose another time.',
          });
        }
        throw insertError;
      }

      return res.status(201).json({
        success: true,
        message: 'Your booking request has been submitted successfully!',
        data: newBooking,
      });
    } else {
      // Mock Store Booking Logic
      service = mockStore.services.find((s) => s.id === service_id);
      if (!service) {
        return res.status(400).json({ success: false, message: 'Invalid makeup service selected.' });
      }

      const blocked = mockStore.blocked_dates.find((b) => b.date === appointment_date);
      if (blocked) {
        return res.status(400).json({
          success: false,
          message: `The studio is closed on ${appointment_date} (${blocked.reason || 'Blocked'}).`,
        });
      }

      dayAvail = mockStore.availability.find((a) => a.day_of_week === dayOfWeek);
      if (!dayAvail || !dayAvail.is_available) {
        return res.status(400).json({
          success: false,
          message: 'The studio is closed on this day of the week.',
        });
      }

      const endTime = calculateEndTime(start_time, service.duration);

      const conflicts = mockStore.bookings.filter(
        (b) => b.appointment_date === appointment_date && b.status !== 'cancelled'
      );

      const isConflict = conflicts.some((b) =>
        isTimeOverlapping(start_time, endTime, b.start_time, b.end_time)
      );

      if (isConflict) {
        return res.status(409).json({
          success: false,
          message: 'This time slot was just reserved or overlaps with an existing appointment. Please select another slot.',
        });
      }

      const bookingRef = generateBookingReference();
      const newBooking = {
        id: `bkg-${Date.now()}`,
        booking_reference: bookingRef,
        customer_id: req.user ? req.user.id : null,
        service_id: service.id,
        full_name,
        email,
        phone,
        appointment_date,
        start_time,
        end_time: endTime,
        message: message || '',
        status: 'pending',
        admin_notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        services: {
          name: service.name,
          price: service.price,
          duration: service.duration,
          image_url: service.image_url,
        },
      };

      mockStore.bookings.unshift(newBooking);

      return res.status(201).json({
        success: true,
        message: 'Your booking request has been submitted successfully!',
        data: newBooking,
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get authenticated customer's bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const userId = req.user.id;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            name,
            price,
            duration,
            image_url
          )
        `)
        .or(`customer_id.eq.${userId},email.eq.${userEmail}`)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    } else {
      const userBookings = mockStore.bookings.filter(
        (b) => b.customer_id === userId || b.email.toLowerCase() === userEmail.toLowerCase()
      );

      const enriched = userBookings.map((b) => {
        const srv = mockStore.services.find((s) => s.id === b.service_id);
        return {
          ...b,
          services: srv ? { name: srv.name, price: srv.price, duration: srv.duration, image_url: srv.image_url } : null,
        };
      });

      return res.json({ success: true, data: enriched });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get single booking details by ID or reference
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            name,
            price,
            duration,
            image_url
          )
        `)
        .or(`id.eq.${id},booking_reference.eq.${id}`)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      // Authorization check: must be owner or admin
      if (req.user && req.user.role !== 'admin' && data.customer_id !== req.user.id && data.email !== req.user.email) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
      }

      return res.json({ success: true, data });
    } else {
      const booking = mockStore.bookings.find(
        (b) => b.id === id || b.booking_reference === id
      );

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      const srv = mockStore.services.find((s) => s.id === booking.service_id);
      return res.json({
        success: true,
        data: {
          ...booking,
          services: srv ? { name: srv.name, price: srv.price, duration: srv.duration, image_url: srv.image_url } : null,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Customer cancel their pending booking
 */
const cancelMyBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (isConfigured && supabase) {
      const { data: booking, error: findError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (findError || !booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      if (booking.customer_id !== userId && booking.email !== userEmail && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
      }

      const { data: updated, error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return res.json({ success: true, message: 'Booking cancelled successfully.', data: updated });
    } else {
      const booking = mockStore.bookings.find((b) => b.id === id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      booking.status = 'cancelled';
      booking.updated_at = new Date().toISOString();

      return res.json({ success: true, message: 'Booking cancelled successfully.', data: booking });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelMyBooking,
};
