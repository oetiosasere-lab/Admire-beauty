import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Sparkles,
  Users,
  Clock,
  MessageSquare,
  BarChart3,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout = ({ children, activeTab, onTabChange }) => {
  const { user, isAdmin, logout, openAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream-100">
        <div className="max-w-md w-full bg-cream-50 p-8 rounded-2xl border border-champagne-300 shadow-luxury text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="font-serif text-3xl font-medium text-espresso-950">
            Administrative Access Only
          </h2>
          <p className="text-sm text-taupe-600 leading-relaxed font-light">
            You must be authenticated with the <strong>Admin</strong> role to access the Admire Beauty business management portal.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => openAuth('login')}
              className="w-full py-3 px-6 rounded-full bg-espresso-900 text-cream-50 text-xs font-semibold uppercase tracking-wider hover:bg-espresso-950 transition-all"
            >
              Sign In As Administrator
            </button>
            <Link
              to="/"
              className="text-xs text-taupe-500 hover:text-espresso-900 font-medium py-1"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings Management', icon: CalendarDays },
    { id: 'calendar', label: 'Appointment Calendar', icon: Calendar },
    { id: 'services', label: 'Service Catalog', icon: Sparkles },
    { id: 'availability', label: 'Hours & Blocked Dates', icon: Clock },
    { id: 'customers', label: 'Client Directory', icon: Users },
    { id: 'support', label: 'Support Helpdesk', icon: MessageSquare },
    { id: 'analytics', label: 'Business Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex flex-col lg:flex-row text-espresso-950">
      {/* Mobile Topbar */}
      <div className="lg:hidden bg-cream-50 border-b border-champagne-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl font-bold uppercase tracking-wider">
          Admire Beauty
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-taupe-700 hover:text-espresso-900"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-cream-50 border-r border-champagne-300 flex flex-col justify-between p-6 z-40 transition-transform lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="border-b border-champagne-200/80 pb-5">
            <Link to="/" className="group block">
              <span className="font-serif text-2xl font-bold tracking-wider text-espresso-950 uppercase block">
                Admire Beauty
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-semibold">
                Studio Management Portal
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left ${
                    isActive
                      ? 'bg-espresso-900 text-cream-50 shadow-sm'
                      : 'text-taupe-700 hover:bg-champagne-100/60 hover:text-espresso-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-taupe-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile / Quick Links */}
        <div className="border-t border-champagne-200/80 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gold-200 text-gold-900 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-espresso-950 truncate">{user.full_name}</p>
              <p className="text-[10px] text-gold-700 uppercase font-semibold">Verified Admin</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-1.5 text-xs text-taupe-600">
            <Link
              to="/"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-champagne-100 hover:text-espresso-950 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
