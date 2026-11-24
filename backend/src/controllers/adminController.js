const { supabase, isConfigured, mockStore } = require('../config/supabase');
const { calculateEndTime } = require('../services/bookingService');

/**
 * 1. Admin Dashboard Overview
 * Aggregates actual Supabase database statistics
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      // Fetch bookings count by status
      const { data: allBookings, error: bksErr } = await supabase
        .from('bookings')
        .select('id, status, service_id, appointment_date, start_time, end_time, full_name, email, created_at, services(name, price)')
        .order('created_at', { ascending: false });

      if (bksErr) throw bksErr;

      // Fetch total registered customers
      const { count: customerCount, error: usrErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (usrErr) throw usrErr;

      // Group by status
      const totalBookings = allBookings.length;
      const confirmed = allBookings.filter((b) => b.status === 'confirmed').length;
      const pending = allBookings.filter((b) => b.status === 'pending').length;
      const completed = allBookings.filter((b) => b.status === 'completed').length;
      const cancelled = allBookings.filter((b) => b.status === 'cancelled').length;

      // Bookings per service
      const serviceCounts = {};
      allBookings.forEach((b) => {
        const sName = b.services?.name || 'Standard Makeup';
        serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
      });

      // Upcoming appointments (future dates, non-cancelled)
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = allBookings
        .filter((b) => b.appointment_date >= todayStr && b.status !== 'cancelled')
        .sort((a, b) => (a.appointment_date + a.start_time).localeCompare(b.appointment_date + b.start_time))
        .slice(0, 5);

      // Recent activity
      const recentActivity = allBookings.slice(0, 6).map((b) => ({
        id: b.id,
        title: `Booking ${b.status}: ${b.full_name}`,
        service: b.services?.name,
        date: b.appointment_date,
        time: b.start_time,
        timestamp: b.created_at,
      }));

      return res.json({
        success: true,
        data: {
          statistics: {
            totalBookings,
            confirmed,
            pending,
            completed,
            cancelled,
            totalCustomers: customerCount || 0,
          },
          serviceDistribution: Object.entries(serviceCounts).map(([name, count]) => ({ name, count })),
          upcomingAppointments: upcoming,
          recentActivity,
          revenueStatus: {
            connected: false,
            message: 'Direct payment gateway integration is currently disconnected. Revenue statistics unavailable.',
          },
        },
      });
    } else {
      // Mock Store Dashboard Stats
      const allBookings = mockStore.bookings;
      const totalBookings = allBookings.length;
      const confirmed = allBookings.filter((b) => b.status === 'confirmed').length;
      const pending = allBookings.filter((b) => b.status === 'pending').length;
      const completed = allBookings.filter((b) => b.status === 'completed').length;
      const cancelled = allBookings.filter((b) => b.status === 'cancelled').length;
      const totalCustomers = mockStore.profiles.filter((p) => p.role === 'customer').length;

      const serviceCounts = {};
      allBookings.forEach((b) => {
        const srv = mockStore.services.find((s) => s.id === b.service_id);
        const name = srv?.name || 'Standard Service';
        serviceCounts[name] = (serviceCounts[name] || 0) + 1;
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = allBookings
        .filter((b) => b.appointment_date >= todayStr && b.status !== 'cancelled')
        .map((b) => ({
          ...b,
          services: mockStore.services.find((s) => s.id === b.service_id),
        }))
        .slice(0, 5);

      const recentActivity = allBookings.slice(0, 6).map((b) => {
        const srv = mockStore.services.find((s) => s.id === b.service_id);
        return {
          id: b.id,
          title: `Booking ${b.status}: ${b.full_name}`,
          service: srv?.name,
          date: b.appointment_date,
          time: b.start_time,
          timestamp: b.created_at,
        };
      });

      return res.json({
        success: true,
        data: {
          statistics: {
            totalBookings,
            confirmed,
            pending,
            completed,
            cancelled,
            totalCustomers,
          },
          serviceDistribution: Object.entries(serviceCounts).map(([name, count]) => ({ name, count })),
          upcomingAppointments: upcoming,
          recentActivity,
          revenueStatus: {
            connected: false,
            message: 'Direct payment gateway integration is currently disconnected. Revenue statistics unavailable.',
          },
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Bookings Management (Filter, Search, Sort)
 */
const getBookings = async (req, res, next) => {
  try {
    const { status, serviceId, date, search } = req.query;

    if (isConfigured && supabase) {
      let query = supabase
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
        .order('appointment_date', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (serviceId && serviceId !== 'all') {
        query = query.eq('service_id', serviceId);
      }
      if (date) {
        query = query.eq('appointment_date', date);
      }
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,booking_reference.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, data });
    } else {
      let list = [...mockStore.bookings];

      if (status && status !== 'all') {
        list = list.filter((b) => b.status === status);
      }
      if (serviceId && serviceId !== 'all') {
        list = list.filter((b) => b.service_id === serviceId);
      }
      if (date) {
        list = list.filter((b) => b.appointment_date === date);
      }
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(
          (b) =>
            b.full_name.toLowerCase().includes(s) ||
            b.email.toLowerCase().includes(s) ||
            b.booking_reference.toLowerCase().includes(s)
        );
      }

      const enriched = list.map((b) => ({
        ...b,
        services: mockStore.services.find((srv) => srv.id === b.service_id),
      }));

      return res.json({ success: true, data: enriched });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Update Booking (Status, Reschedule, Admin notes)
 */
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, appointment_date, start_time, admin_notes } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    if (appointment_date && start_time) {
      updates.appointment_date = appointment_date;
      updates.start_time = start_time;
      // Calculate end time
      let duration = 90;
      if (isConfigured && supabase) {
        const { data: b } = await supabase.from('bookings').select('service_id, services(duration)').eq('id', id).single();
        if (b?.services?.duration) duration = b.services.duration;
      } else {
        const b = mockStore.bookings.find((item) => item.id === id);
        const srv = mockStore.services.find((s) => s.id === b?.service_id);
        if (srv?.duration) duration = srv.duration;
      }
      updates.end_time = calculateEndTime(start_time, duration);
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select(`*, services(name, price, duration)`)
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Booking updated successfully.', data });
    } else {
      const booking = mockStore.bookings.find((b) => b.id === id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      Object.assign(booking, updates, { updated_at: new Date().toISOString() });
      const srv = mockStore.services.find((s) => s.id === booking.service_id);
      return res.json({
        success: true,
        message: 'Booking updated successfully.',
        data: { ...booking, services: srv },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Customer Directory
 */
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;

    if (isConfigured && supabase) {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          created_at,
          bookings (id, status, appointment_date)
        `)
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted = (data || []).map((c) => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
        created_at: c.created_at,
        totalBookings: c.bookings?.length || 0,
        recentBookings: c.bookings || [],
      }));

      return res.json({ success: true, data: formatted });
    } else {
      let customers = mockStore.profiles.filter((p) => p.role === 'customer');
      if (search) {
        const s = search.toLowerCase();
        customers = customers.filter(
          (c) => c.full_name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s)
        );
      }

      const formatted = customers.map((c) => {
        const userBookings = mockStore.bookings.filter((b) => b.customer_id === c.id || b.email === c.email);
        return {
          id: c.id,
          full_name: c.full_name,
          email: c.email,
          phone: c.phone,
          created_at: c.created_at,
          totalBookings: userBookings.length,
          recentBookings: userBookings,
        };
      });

      return res.json({ success: true, data: formatted });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Service Management (CRUD)
 */
const getAdminServices = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return res.json({ success: true, data });
    } else {
      return res.json({ success: true, data: mockStore.services });
    }
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, image_url, is_active } = req.body;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name,
          description,
          price: parseFloat(price),
          duration: parseInt(duration, 10) || 90,
          image_url: image_url || '',
          is_active: is_active !== undefined ? is_active : true,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Service created successfully.', data });
    } else {
      const newService = {
        id: `srv-${Date.now()}`,
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration, 10) || 90,
        image_url: image_url || '',
        is_active: is_active !== undefined ? is_active : true,
        sort_order: mockStore.services.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockStore.services.push(newService);
      return res.status(201).json({ success: true, message: 'Service created successfully.', data: newService });
    }
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, image_url, is_active } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (duration !== undefined) updates.duration = parseInt(duration, 10);
    if (image_url !== undefined) updates.image_url = image_url;
    if (is_active !== undefined) updates.is_active = is_active;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Service updated successfully.', data });
    } else {
      const srv = mockStore.services.find((s) => s.id === id);
      if (!srv) return res.status(404).json({ success: false, message: 'Service not found.' });

      Object.assign(srv, updates, { updated_at: new Date().toISOString() });
      return res.json({ success: true, message: 'Service updated successfully.', data: srv });
    }
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      // Soft-delete to preserve booking history
      const { data, error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Service archived successfully.' });
    } else {
      const srv = mockStore.services.find((s) => s.id === id);
      if (!srv) return res.status(404).json({ success: false, message: 'Service not found.' });
      srv.is_active = false;
      return res.json({ success: true, message: 'Service archived successfully.' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Availability & Schedule Management
 */
const getAdminAvailability = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const { data: schedule, error: schErr } = await supabase
        .from('availability')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (schErr) throw schErr;

      const { data: blocked, error: blkErr } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true });

      if (blkErr) throw blkErr;

      return res.json({
        success: true,
        data: {
          schedule,
          blockedDates: blocked || [],
        },
      });
    } else {
      return res.json({
        success: true,
        data: {
          schedule: mockStore.availability,
          blockedDates: mockStore.blocked_dates,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateAvailabilitySchedule = async (req, res, next) => {
  try {
    const { schedules } = req.body; // Array of { day_of_week, start_time, end_time, is_available, slot_duration_minutes, buffer_minutes }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ success: false, message: 'Expected an array of schedule objects.' });
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('availability')
        .upsert(schedules, { onConflict: 'day_of_week' })
        .select();

      if (error) throw error;
      return res.json({ success: true, message: 'Availability schedule updated.', data });
    } else {
      schedules.forEach((item) => {
        const existing = mockStore.availability.find((a) => a.day_of_week === item.day_of_week);
        if (existing) {
          Object.assign(existing, item, { updated_at: new Date().toISOString() });
        } else {
          mockStore.availability.push({ id: `av-${item.day_of_week}`, ...item });
        }
      });
      return res.json({ success: true, message: 'Availability schedule updated.', data: mockStore.availability });
    }
  } catch (err) {
    next(err);
  }
};

const addBlockedDate = async (req, res, next) => {
  try {
    const { date, reason } = req.body;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert({ date, reason: reason || 'Studio closed' })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Blocked date added.', data });
    } else {
      const newBlocked = {
        id: `blk-${Date.now()}`,
        date,
        reason: reason || 'Studio closed',
        created_at: new Date().toISOString(),
      };
      mockStore.blocked_dates.push(newBlocked);
      return res.status(201).json({ success: true, message: 'Blocked date added.', data: newBlocked });
    }
  } catch (err) {
    next(err);
  }
};

const deleteBlockedDate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true, message: 'Blocked date removed.' });
    } else {
      mockStore.blocked_dates = mockStore.blocked_dates.filter((b) => b.id !== id);
      return res.json({ success: true, message: 'Blocked date removed.' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Support Tickets (Admin view & status update)
 */
const getAdminSupportTickets = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (isConfigured && supabase) {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          support_replies (*)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, data });
    } else {
      let list = [...mockStore.support_tickets];
      if (status && status !== 'all') {
        list = list.filter((t) => t.status === status);
      }

      const enriched = list.map((t) => ({
        ...t,
        support_replies: mockStore.support_replies.filter((r) => r.ticket_id === t.id),
      }));

      return res.json({ success: true, data: enriched });
    }
  } catch (err) {
    next(err);
  }
};

const updateSupportTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket status.' });
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Ticket status updated.', data });
    } else {
      const ticket = mockStore.support_tickets.find((t) => t.id === id);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

      ticket.status = status;
      ticket.updated_at = new Date().toISOString();
      return res.json({ success: true, message: 'Ticket status updated.', data: ticket });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Business Activity & Analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    let bookings = [];

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, appointment_date, status, service_id, services(name, price)');
      if (error) throw error;
      bookings = data || [];
    } else {
      bookings = mockStore.bookings.map((b) => ({
        ...b,
        services: mockStore.services.find((s) => s.id === b.service_id),
      }));
    }

    // Monthly totals for current year
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((m, idx) => ({ month: m, bookings: 0 }));

    bookings.forEach((b) => {
      const date = new Date(b.appointment_date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].bookings += 1;
      }
    });

    // Popular services
    const serviceCounts = {};
    bookings.forEach((b) => {
      const sName = b.services?.name || 'Makeup Artistry';
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    });

    // Status breakdown
    const statusBreakdown = {
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };

    return res.json({
      success: true,
      data: {
        monthlyTrends: monthlyData,
        popularServices: Object.entries(serviceCounts).map(([name, count]) => ({ name, count })),
        statusBreakdown,
        totalBookings: bookings.length,
        paymentNote: 'Payment provider integration pending. Direct cash/card on arrival or bank transfer is currently utilized.',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardOverview,
  getBookings,
  updateBooking,
  getCustomers,
  getAdminServices,
  createService,
  updateService,
  deleteService,
  getAdminAvailability,
  updateAvailabilitySchedule,
  addBlockedDate,
  deleteBlockedDate,
  getAdminSupportTickets,
  updateSupportTicketStatus,
  getAnalytics,
};
