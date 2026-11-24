import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Filter,
} from 'lucide-react';

export const AdminCalendar = () => {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await api.admin.getBookings();
        if (res.success && res.data) {
          setBookings(res.data);
        }
      } catch (err) {
        console.error('Error fetching calendar bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Navigation handlers
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const todayPeriod = () => {
    setCurrentDate(new Date());
  };

  // Helper: Month name
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Month grid calculation
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Filter bookings for a given date YYYY-MM-DD
  const getBookingsForDate = (dateStr) => {
    return bookings.filter((b) => b.appointment_date === dateStr && b.status !== 'cancelled');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
            Artist Schedule
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
            Appointment Calendar
          </h1>
        </div>

        {/* View Switcher & Date Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-champagne-300 p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-espresso-900 text-cream-50' : 'text-taupe-700 hover:text-espresso-950'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-espresso-900 text-cream-50' : 'text-taupe-700 hover:text-espresso-950'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-espresso-900 text-cream-50' : 'text-taupe-700 hover:text-espresso-950'
              }`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white rounded-xl border border-champagne-300 p-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg hover:bg-champagne-100 text-taupe-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={todayPeriod}
              className="px-2.5 py-1 text-xs font-medium text-espresso-900 hover:bg-champagne-100 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg hover:bg-champagne-100 text-taupe-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-lg font-serif font-bold text-espresso-900">
        {monthName} {viewMode === 'day' && ` - Day ${currentDate.getDate()}`}
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-champagne-300 shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-cream-100/70 border-b border-champagne-200 text-center text-[11px] font-bold uppercase tracking-wider text-taupe-600 py-3">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-champagne-100 min-h-[500px]">
            {/* Empty offset days */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-cream-50/50 p-2 min-h-[90px]" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayBookings = getBookingsForDate(dateStr);
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`p-2 sm:p-2.5 min-h-[100px] flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-champagne-50/60 font-bold' : 'hover:bg-cream-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`inline-block w-6 h-6 rounded-full text-center leading-6 ${
                        isToday ? 'bg-gold-500 text-espresso-950 font-bold' : 'text-espresso-900'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-semibold text-gold-700">
                        {dayBookings.length} appt{dayBookings.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Appointments list */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px]">
                    {dayBookings.map((b) => (
                      <div
                        key={b.id}
                        className={`px-1.5 py-1 rounded text-[10px] truncate border ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                        title={`${b.start_time} - ${b.full_name} (${b.services?.name})`}
                      >
                        <span className="font-bold">{b.start_time}</span> {b.full_name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY & WEEK SCHEDULE CARDS VIEW */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white rounded-2xl border border-champagne-300 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-2xl font-medium text-espresso-950">
            Appointments for {currentDate.toDateString()}
          </h3>

          {(() => {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayBookings = getBookingsForDate(dateStr);

            if (dayBookings.length === 0) {
              return (
                <p className="text-xs text-taupe-500 py-6 text-center">
                  No appointments scheduled for this date.
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {dayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-cream-50 rounded-xl border border-champagne-200 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        <span className="font-bold text-espresso-950 text-sm">
                          {b.start_time} – {b.end_time}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="font-semibold text-espresso-900">
                        {b.full_name} • {b.services?.name || 'Makeup Artistry'}
                      </p>
                      <p className="text-taupe-500">
                        Phone: {b.phone} | Email: {b.email}
                      </p>
                      {b.message && (
                        <p className="text-taupe-600 italic">"{b.message}"</p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-lg font-bold text-espresso-900 block">
                        £{parseFloat(b.services?.price || 0).toFixed(2)}
                      </span>
                      <span className="font-mono text-[10px] text-taupe-400">
                        {b.booking_reference}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
