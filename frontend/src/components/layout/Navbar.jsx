import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, Calendar, ShieldCheck, LogOut, MessageSquare, ChevronDown } from 'lucide-react';

export const Navbar = ({ onOpenBooking }) => {
  const { user, isAuthenticated, isAdmin, logout, openAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'Services', href: '/#services' },
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'About Me', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (location.pathname !== '/') {
        navigate(`/${href}`);
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-cream-100/90 backdrop-blur-md shadow-sm border-b border-champagne-200/50 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Brand Name */}
          <Link to="/" className="flex flex-col group">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-espresso-950 uppercase group-hover:text-gold-600 transition-colors">
              Admire Beauty
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-taupe-500 font-medium -mt-1">
              Makeup Artistry & Studio
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-taupe-800 hover:text-gold-600 tracking-wide transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-champagne-300 bg-cream-50 hover:bg-champagne-100/50 transition-colors text-sm font-medium text-espresso-900"
                >
                  <div className="w-6 h-6 rounded-full bg-gold-200 text-gold-900 flex items-center justify-center text-xs font-semibold">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.full_name || 'My Account'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-taupe-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-cream-50 rounded-xl shadow-luxury-lg border border-champagne-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-champagne-200/60">
                      <p className="text-xs font-medium text-taupe-500">Signed in as</p>
                      <p className="text-sm font-semibold text-espresso-900 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-gold-100 text-gold-800 rounded">
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-taupe-800 hover:bg-champagne-100/60 hover:text-espresso-950 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-gold-600" />
                      <span>My Appointments</span>
                    </Link>

                    <Link
                      to="/account?tab=support"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-taupe-800 hover:bg-champagne-100/60 hover:text-espresso-950 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-gold-600" />
                      <span>Support Helpdesk</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gold-700 bg-gold-50/50 hover:bg-gold-100 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-gold-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-champagne-200/60 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuth('login')}
                className="text-sm font-medium text-taupe-800 hover:text-espresso-950 transition-colors px-3 py-1.5"
              >
                Sign In
              </button>
            )}

            {/* Book Now Primary Button */}
            <button
              onClick={onOpenBooking}
              className="py-2.5 px-5 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Book Now
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onOpenBooking}
              className="py-1.5 px-3.5 rounded-full bg-espresso-900 text-cream-50 text-xs font-semibold uppercase tracking-wider"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-taupe-800 hover:text-espresso-950 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream-50 border-b border-champagne-200 px-6 py-6 shadow-xl animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-left text-base font-medium text-espresso-900 py-1 hover:text-gold-600 transition-colors"
              >
                {link.name}
              </button>
            ))}

            <div className="border-t border-champagne-200 pt-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="text-xs text-taupe-500 font-medium">
                    Signed in as: <strong className="text-espresso-900">{user?.full_name}</strong>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-espresso-900 font-medium py-1"
                  >
                    <Calendar className="w-4 h-4 text-gold-600" />
                    <span>My Appointments</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-semibold text-gold-700 py-1"
                    >
                      <ShieldCheck className="w-4 h-4 text-gold-600" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 text-sm text-red-600 py-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('login');
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-lg border border-champagne-300 text-espresso-900 text-sm font-medium"
                >
                  Sign In / Register
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3 px-4 rounded-lg bg-espresso-900 text-cream-50 text-sm font-semibold uppercase tracking-wider"
              >
                Book Your Appointment
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
