const { supabase, isConfigured, mockStore } = require('../config/supabase');

/**
 * Authentication middleware verifying Supabase JWT tokens.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid format.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (isConfigured && supabase) {
      // Live Supabase token verification
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication session.',
        });
      }

      // Fetch user profile & role securely
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Fallback default customer profile if not yet created in table
        req.user = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Valued Client',
          role: 'customer',
        };
      } else {
        req.user = {
          id: user.id,
          email: user.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role || 'customer',
        };
      }
      return next();
    } else {
      // Local Mock Mode verification
      if (token === 'mock-admin-token' || token.includes('admin')) {
        const adminProfile = mockStore.profiles.find((p) => p.role === 'admin');
        req.user = adminProfile;
        return next();
      }

      // Mock customer token
      const customerProfile = mockStore.profiles.find((p) => p.role === 'customer');
      req.user = customerProfile || {
        id: 'mock-customer-id',
        email: 'customer@example.com',
        full_name: 'Test Customer',
        role: 'customer',
      };
      return next();
    }
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

/**
 * Admin role verification middleware.
 * Ensures the authenticated user has verified 'admin' role.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for administrative access.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrative privileges required.',
    });
  }

  next();
};

/**
 * Optional authentication: attaches user if token is valid, but allows guest access.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    if (isConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        req.user = {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Client',
          phone: profile?.phone,
          role: profile?.role || 'customer',
        };
      }
    } else {
      if (token === 'mock-admin-token') {
        req.user = mockStore.profiles.find((p) => p.role === 'admin');
      } else {
        req.user = mockStore.profiles.find((p) => p.role === 'customer');
      }
    }
  } catch (e) {
    req.user = null;
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
};
