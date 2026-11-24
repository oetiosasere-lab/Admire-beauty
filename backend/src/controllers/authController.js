const { supabase, isConfigured, mockStore } = require('../config/supabase');

/**
 * Customer Registration
 */
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (isConfigured && supabase) {
      // 1. Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone,
          },
        },
      });

      if (authError) {
        return res.status(400).json({
          success: false,
          message: authError.message,
        });
      }

      const user = authData.user;

      // 2. Insert into profiles table with customer role (RLS/trigger will also ensure)
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name,
            email,
            phone,
            role: 'customer',
          });
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Admire Beauty.',
        user: {
          id: user?.id,
          email,
          full_name,
          role: 'customer',
        },
        session: authData.session,
      });
    } else {
      // Mock Store registration
      const existing = mockStore.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const newProfile = {
        id: `usr-${Date.now()}`,
        full_name,
        email,
        phone: phone || '',
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      mockStore.profiles.push(newProfile);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! (Demo Mode)',
        user: newProfile,
        token: `mock-token-${newProfile.id}`,
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Customer & Admin Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          success: false,
          message: error.message || 'Invalid email or password credentials.',
        });
      }

      const user = data.user;

      // Fetch user profile to verify role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return res.json({
        success: true,
        message: 'Login successful.',
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name,
          phone: profile?.phone,
          role: profile?.role || 'customer',
        },
        session: data.session,
        token: data.session?.access_token,
      });
    } else {
      // Mock mode login
      const cleanEmail = email.toLowerCase().trim();
      let profile = mockStore.profiles.find((p) => p.email.toLowerCase() === cleanEmail);

      // Support instant demo login for admin
      if (cleanEmail === 'admin@admirebeauty.com' || cleanEmail.includes('admin')) {
        profile = mockStore.profiles.find((p) => p.role === 'admin');
        return res.json({
          success: true,
          message: 'Admin demo login successful.',
          user: profile,
          token: 'mock-admin-token',
        });
      }

      if (!profile) {
        // Auto-provision demo customer
        profile = {
          id: `usr-${Date.now()}`,
          full_name: cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: '',
          role: 'customer',
          created_at: new Date().toISOString(),
        };
        mockStore.profiles.push(profile);
      }

      return res.json({
        success: true,
        message: 'Login successful (Demo Mode).',
        user: profile,
        token: `mock-customer-token-${profile.id}`,
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get currently authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout
 */
const logout = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
