const { supabase, isConfigured, mockStore } = require('../config/supabase');
const { getAvailableSlotsForDate } = require('../services/bookingService');

/**
 * Get business availability schedule or time slots for a specific date
 */
const getAvailability = async (req, res, next) => {
  try {
    const { date, serviceId } = req.query;

    // If a specific date is requested, calculate available time slots dynamically
    if (date) {
      const slotData = await getAvailableSlotsForDate(date, serviceId);
      return res.json({ success: true, data: slotData });
    }

    // Otherwise, return weekly availability overview
    if (isConfigured && supabase) {
      const { data: schedule, error: schError } = await supabase
        .from('availability')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (schError) throw schError;

      const { data: blocked, error: blkError } = await supabase
        .from('blocked_dates')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (blkError) throw blkError;

      return res.json({
        success: true,
        data: {
          schedule,
          blockedDates: blocked || [],
        },
      });
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const futureBlocked = mockStore.blocked_dates.filter((b) => b.date >= todayStr);

      return res.json({
        success: true,
        data: {
          schedule: mockStore.availability,
          blockedDates: futureBlocked,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get all blocked holiday dates
 */
const getBlockedDates = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return res.json({ success: true, data });
    } else {
      return res.json({ success: true, data: mockStore.blocked_dates });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailability,
  getBlockedDates,
};
