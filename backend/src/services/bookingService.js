const { supabase, isConfigured, mockStore } = require('../config/supabase');

/**
 * Generate a unique, luxury booking reference (e.g., AB-2026-8941)
 */
const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `AB-${year}-${randomNum}`;
};

/**
 * Helper to parse time string "HH:MM" or "HH:MM:SS" into minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1];
};

/**
 * Helper to convert minutes from midnight to "HH:MM"
 */
const minutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}`;
};

/**
 * Calculate appointment end time given start time and duration in minutes
 */
const calculateEndTime = (startTime, durationMinutes) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
};

/**
 * Check if two time intervals overlap: [startA, endA) and [startB, endB)
 */
const isTimeOverlapping = (startA, endA, startB, endB) => {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return Math.max(a1, b1) < Math.min(a2, b2);
};

/**
 * Get available time slots for a given date and service
 */
const getAvailableSlotsForDate = async (dateStr, serviceId) => {
  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  // Check if date is in the past (before today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateStr + 'T00:00:00');
  if (checkDate < today) {
    return {
      date: dateStr,
      isAvailable: false,
      reason: 'Date is in the past',
      slots: [],
    };
  }

  const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  let dayConfig = null;
  let isBlocked = false;
  let blockedReason = null;
  let service = null;
  let existingBookings = [];

  if (isConfigured && supabase) {
    // 1. Check if date is blocked
    const { data: blocked } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('date', dateStr)
      .maybeSingle();

    if (blocked) {
      return {
        date: dateStr,
        isAvailable: false,
        reason: blocked.reason || 'Studio closed on this date',
        slots: [],
      };
    }

    // 2. Fetch business availability schedule for day of week
    const { data: avail } = await supabase
      .from('availability')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();

    dayConfig = avail;

    // 3. Fetch service duration
    if (serviceId) {
      const { data: srv } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
      service = srv;
    }

    // 4. Fetch existing non-cancelled bookings on this date
    const { data: bks } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled');

    existingBookings = bks || [];
  } else {
    // Mock Store mode
    const blocked = mockStore.blocked_dates.find((b) => b.date === dateStr);
    if (blocked) {
      return {
        date: dateStr,
        isAvailable: false,
        reason: blocked.reason || 'Studio closed on this date',
        slots: [],
      };
    }

    dayConfig = mockStore.availability.find((a) => a.day_of_week === dayOfWeek);
    if (serviceId) {
      service = mockStore.services.find((s) => s.id === serviceId);
    }
    existingBookings = mockStore.bookings.filter(
      (b) => b.appointment_date === dateStr && b.status !== 'cancelled'
    );
  }

  if (!dayConfig || !dayConfig.is_available) {
    return {
      date: dateStr,
      isAvailable: false,
      reason: 'Studio is closed on this day of the week',
      slots: [],
    };
  }

  // Duration in minutes (defaults to service duration or 90 mins)
  const duration = service?.duration || dayConfig.slot_duration_minutes || 90;
  const buffer = dayConfig.buffer_minutes || 15;
  const step = duration + buffer;

  const startMinutes = timeToMinutes(dayConfig.start_time);
  const endMinutes = timeToMinutes(dayConfig.end_time);

  const slots = [];
  let currentMinutes = startMinutes;

  while (currentMinutes + duration <= endMinutes) {
    const slotStart = minutesToTime(currentMinutes);
    const slotEnd = minutesToTime(currentMinutes + duration);

    // Check if slot overlaps with any existing booking
    const hasConflict = existingBookings.some((booking) => {
      return isTimeOverlapping(slotStart, slotEnd, booking.start_time, booking.end_time);
    });

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isBooked: hasConflict,
    });

    currentMinutes += step;
  }

  return {
    date: dateStr,
    isAvailable: true,
    dayOfWeek,
    workingHours: {
      start: dayConfig.start_time,
      end: dayConfig.end_time,
    },
    slots,
  };
};

module.exports = {
  generateBookingReference,
  calculateEndTime,
  isTimeOverlapping,
  getAvailableSlotsForDate,
  timeToMinutes,
  minutesToTime,
};
