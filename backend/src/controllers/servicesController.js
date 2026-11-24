const { supabase, isConfigured, mockStore } = require('../config/supabase');

/**
 * Get all active makeup services
 */
const getAllServices = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return res.json({ success: true, data });
    } else {
      const services = mockStore.services.filter((s) => s.is_active);
      return res.json({ success: true, data: services });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get service by ID
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }
      return res.json({ success: true, data });
    } else {
      const service = mockStore.services.find((s) => s.id === id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }
      return res.json({ success: true, data: service });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
};
