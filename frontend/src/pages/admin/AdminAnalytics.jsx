import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BarChart3, TrendingUp, PieChart, AlertCircle, Sparkles, DollarSign } from 'lucide-react';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.admin.getAnalytics();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-taupe-500">
        Compiling business analytics and trends...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
        Unable to load analytics.
      </div>
    );
  }

  const { monthlyTrends, popularServices, statusBreakdown, totalBookings, paymentNote } = analytics;

  // Maximum value for trend scaling
  const maxMonthly = Math.max(...monthlyTrends.map((m) => m.bookings), 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
          Strategic Insights
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
          Business Activity & Analytics
        </h1>
      </div>

      {/* Revenue Connection Callout (Compliant with spec rule #6) */}
      <div className="p-5 bg-champagne-100/70 border border-gold-300 rounded-2xl flex items-start sm:items-center gap-3.5 text-xs text-taupe-800">
        <DollarSign className="w-5 h-5 text-gold-700 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <strong className="text-espresso-950 font-bold block">
            Payment Gateway Status: Not Connected
          </strong>
          <span>
            {paymentNote || 'Online payment processing via Stripe is currently not connected. Revenue calculations will automatically activate once merchant credentials are added.'}
          </span>
        </div>
      </div>

      {/* Monthly Booking Trends Bar Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-champagne-100 pb-3">
          <div>
            <h3 className="font-serif text-2xl font-medium text-espresso-950">
              Monthly Booking Volume ({new Date().getFullYear()})
            </h3>
            <p className="text-xs text-taupe-500">
              Total appointments scheduled by calendar month
            </p>
          </div>
          <span className="text-xs font-semibold text-gold-700">
            Total: {totalBookings}
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-48 flex items-end justify-between gap-2 pt-6">
          {monthlyTrends.map((item, idx) => {
            const heightPercent = Math.round((item.bookings / maxMonthly) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-taupe-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.bookings}
                </span>
                <div
                  className="w-full max-w-[28px] bg-champagne-200 group-hover:bg-gold-500 rounded-t-md transition-all duration-300"
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
                <span className="text-[10px] uppercase font-bold text-taupe-600">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown & Popular Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-5">
          <h3 className="font-serif text-2xl font-medium text-espresso-950 border-b border-champagne-100 pb-3">
            Appointment Status Breakdown
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold block">
                Pending Approval
              </span>
              <span className="font-serif text-3xl font-bold text-amber-950">
                {statusBreakdown.pending}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block">
                Confirmed Slots
              </span>
              <span className="font-serif text-3xl font-bold text-emerald-950">
                {statusBreakdown.confirmed}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold block">
                Completed
              </span>
              <span className="font-serif text-3xl font-bold text-blue-950">
                {statusBreakdown.completed}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
              <span className="text-[10px] uppercase tracking-wider text-stone-700 font-bold block">
                Cancelled
              </span>
              <span className="font-serif text-3xl font-bold text-stone-900">
                {statusBreakdown.cancelled}
              </span>
            </div>
          </div>
        </div>

        {/* Most Popular Services */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-5">
          <h3 className="font-serif text-2xl font-medium text-espresso-950 border-b border-champagne-100 pb-3">
            Service Popularity
          </h3>

          <div className="space-y-4 text-xs">
            {popularServices.map((srv, idx) => {
              const total = totalBookings || 1;
              const percent = Math.round((srv.count / total) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-espresso-900">
                    <span>{srv.name}</span>
                    <span>{srv.count} appointments ({percent}%)</span>
                  </div>
                  <div className="w-full bg-champagne-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-espresso-900 h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
