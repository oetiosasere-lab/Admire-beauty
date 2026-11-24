import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const AdminOverview = ({ onNavigateTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getOverview();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve admin overview statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-taupe-500">
        Loading live studio dashboard metrics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
        {error || 'Error loading dashboard.'}
      </div>
    );
  }

  const { statistics, serviceDistribution, upcomingAppointments, recentActivity, revenueStatus } = data;

  const statCards = [
    {
      title: 'Total Bookings',
      value: statistics.totalBookings,
      icon: CalendarDays,
      bg: 'bg-white',
      border: 'border-champagne-300',
      text: 'text-espresso-950',
    },
    {
      title: 'Pending Approvals',
      value: statistics.pending,
      icon: Clock,
      bg: 'bg-amber-50/80',
      border: 'border-amber-300',
      text: 'text-amber-900',
      highlight: true,
    },
    {
      title: 'Confirmed Slots',
      value: statistics.confirmed,
      icon: CheckCircle,
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
    },
    {
      title: 'Completed Appointments',
      value: statistics.completed,
      icon: Sparkles,
      bg: 'bg-white',
      border: 'border-champagne-300',
      text: 'text-espresso-950',
    },
    {
      title: 'Cancelled Requests',
      value: statistics.cancelled,
      icon: XCircle,
      bg: 'bg-white',
      border: 'border-champagne-300',
      text: 'text-taupe-700',
    },
    {
      title: 'Registered Clients',
      value: statistics.totalCustomers,
      icon: Users,
      bg: 'bg-white',
      border: 'border-champagne-300',
      text: 'text-espresso-950',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
            Executive Summary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
            Studio Performance & Operations
          </h1>
        </div>

        <button
          onClick={() => onNavigateTab('bookings')}
          className="py-2.5 px-5 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <span>Manage All Bookings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Revenue Status Notice (Per prompt requirement) */}
      <div className="p-4 bg-champagne-100/70 border border-gold-300 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-taupe-800">
        <AlertCircle className="w-4 h-4 text-gold-700 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <strong>Payment Gateway Note:</strong> {revenueStatus?.message}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${card.border} ${card.bg} shadow-sm flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between text-taupe-500">
                <Icon className="w-4 h-4" />
                {card.highlight && card.value > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <div>
                <p className={`font-serif text-3xl font-bold ${card.text}`}>
                  {card.value}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-taupe-500 font-semibold mt-1">
                  {card.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Upcoming & Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-champagne-100 pb-3">
            <h3 className="font-serif text-2xl font-medium text-espresso-950">
              Upcoming Schedule
            </h3>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-semibold text-gold-700 hover:underline"
            >
              Open Calendar →
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <p className="text-xs text-taupe-500 py-6 text-center">
              No appointments scheduled for upcoming dates.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 bg-cream-50 rounded-xl border border-champagne-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-espresso-950 text-sm">
                      {app.full_name}
                    </p>
                    <p className="text-taupe-500">
                      {app.services?.name || 'Makeup Service'} • {app.appointment_date} at {app.start_time}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookings per Makeup Service Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-5">
          <h3 className="font-serif text-2xl font-medium text-espresso-950 border-b border-champagne-100 pb-3">
            Service Distribution
          </h3>

          <div className="space-y-4">
            {serviceDistribution.map((item, idx) => {
              const total = statistics.totalBookings || 1;
              const percent = Math.round((item.count / total) * 100);
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-espresso-900">
                    <span>{item.name}</span>
                    <span>{item.count} bookings ({percent}%)</span>
                  </div>
                  <div className="w-full bg-champagne-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gold-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Business Activity */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-4">
        <h3 className="font-serif text-2xl font-medium text-espresso-950">
          Recent Activity Log
        </h3>
        <div className="divide-y divide-champagne-100">
          {recentActivity.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <strong className="text-espresso-950">{act.title}</strong>
                <span className="text-taupe-500 ml-2">
                  ({act.service} on {act.date} at {act.time})
                </span>
              </div>
              <span className="text-taupe-400 font-mono">
                {new Date(act.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
