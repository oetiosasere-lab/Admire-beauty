import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Sparkles, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, authModalTab, closeAuth, openAuth, login, register } = useAuth();
  const [tab, setTab] = useState(authModalTab);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync tab with context if opened from external link
  React.useEffect(() => {
    setTab(authModalTab);
    setError('');
  }, [authModalTab]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    try {
      await login('admin@admirebeauty.com', 'adminpassword123');
    } catch (err) {
      setError('Could not log in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClient = async () => {
    setLoading(true);
    try {
      await login('elena@example.com', 'password123');
    } catch (err) {
      setError('Could not log in as client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuth}
      title={tab === 'login' ? 'Client Sign In' : 'Create Account'}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Tab switch */}
        <div className="flex border-b border-champagne-200">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'border-b-2 border-gold-500 text-espresso-950 font-semibold'
                : 'text-taupe-500 hover:text-espresso-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === 'register'
                ? 'border-b-2 border-gold-500 text-espresso-950 font-semibold'
                : 'text-taupe-500 hover:text-espresso-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Jessica Sterling"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+44 7700 900123"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-espresso-900 hover:bg-espresso-950 text-cream-50 font-medium text-sm rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              'Authenticating...'
            ) : tab === 'login' ? (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access Buttons for seamless testing */}
        <div className="pt-4 border-t border-champagne-200">
          <p className="text-xs text-taupe-500 text-center mb-3">
            Instant Demo Sign-In (For Testing):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoClient}
              className="py-2 px-3 text-xs font-medium border border-champagne-300 bg-white hover:bg-champagne-50 text-taupe-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Demo Client</span>
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2 px-3 text-xs font-medium border border-gold-300 bg-gold-50 hover:bg-gold-100 text-gold-900 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
