import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Clock, Calendar, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminAvailability = () => {
  const [schedule, setSchedule] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [newBlocked, setNewBlocked] = useState({ date: '', reason: '' });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getAvailability();
      if (res.success && res.data) {
        setSchedule(res.data.schedule || []);
        setBlockedDates(res.data.blockedDates || []);
      }
    } catch (err) {
      console.error('Error fetching admin availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleToggleDay = (dayIndex) => {
    const updated = schedule.map((item) => {
      if (item.day_of_week === dayIndex) {
        return { ...item, is_available: !item.is_available };
      }
      return item;
    });
    setSchedule(updated);
  };

  const handleTimeChange = (dayIndex, field, value) => {
    const updated = schedule.map((item) => {
      if (item.day_of_week === dayIndex) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setSchedule(updated);
  };

  const handleSaveSchedule = async () => {
    try {
      const res = await api.admin.updateAvailability(schedule);
      if (res.success) {
        setFeedback('Weekly schedule saved successfully.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Error updating schedule.');
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newBlocked.date) return;
    try {
      const res = await api.admin.addBlockedDate(newBlocked);
      if (res.success) {
        setNewBlocked({ date: '', reason: '' });
        loadAvailability();
        setFeedback('Blocked holiday date added.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Error adding blocked date.');
    }
  };

  const handleDeleteBlockedDate = async (id) => {
    try {
      const res = await api.admin.deleteBlockedDate(id);
      if (res.success) {
        loadAvailability();
        setFeedback('Blocked date removed.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      alert('Error removing blocked date.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
            Studio Operational Rules
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
            Availability & Blocked Holidays
          </h1>
        </div>

        <button
          onClick={handleSaveSchedule}
          className="py-2.5 px-6 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
        >
          Save Weekly Schedule
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          ✓ {feedback}
        </div>
      )}

      {/* Weekly Working Days & Hours Grid */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-5">
        <h3 className="font-serif text-2xl font-medium text-espresso-950 border-b border-champagne-100 pb-3">
          Weekly Working Schedule
        </h3>

        <div className="divide-y divide-champagne-100">
          {schedule.map((day) => (
            <div
              key={day.day_of_week}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3 w-40">
                <input
                  type="checkbox"
                  id={`day-avail-${day.day_of_week}`}
                  checked={day.is_available}
                  onChange={() => handleToggleDay(day.day_of_week)}
                  className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                />
                <label
                  htmlFor={`day-avail-${day.day_of_week}`}
                  className={`font-bold uppercase tracking-wider ${
                    day.is_available ? 'text-espresso-950' : 'text-taupe-400 line-through'
                  }`}
                >
                  {dayNames[day.day_of_week]}
                </label>
              </div>

              {day.is_available ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-taupe-500">Opens:</span>
                    <input
                      type="time"
                      value={day.start_time.slice(0, 5)}
                      onChange={(e) =>
                        handleTimeChange(day.day_of_week, 'start_time', `${e.target.value}:00`)
                      }
                      className="p-1.5 rounded-lg border border-champagne-300 bg-cream-50 font-medium"
                    />
                  </div>

                  <span className="text-taupe-400">to</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-taupe-500">Closes:</span>
                    <input
                      type="time"
                      value={day.end_time.slice(0, 5)}
                      onChange={(e) =>
                        handleTimeChange(day.day_of_week, 'end_time', `${e.target.value}:00`)
                      }
                      className="p-1.5 rounded-lg border border-champagne-300 bg-cream-50 font-medium"
                    />
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 ml-4">
                    <span className="text-taupe-500">Buffer:</span>
                    <select
                      value={day.buffer_minutes || 15}
                      onChange={(e) =>
                        handleTimeChange(day.day_of_week, 'buffer_minutes', parseInt(e.target.value, 10))
                      }
                      className="p-1 rounded-lg border border-champagne-300 bg-cream-50"
                    >
                      <option value={10}>10 min</option>
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                    </select>
                  </div>
                </div>
              ) : (
                <span className="text-taupe-400 italic">Studio Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Dates (Holidays, Vacations, Private Events) */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne-300 shadow-sm space-y-5">
        <h3 className="font-serif text-2xl font-medium text-espresso-950 border-b border-champagne-100 pb-3">
          Blocked Dates & Studio Closures
        </h3>
        <p className="text-xs text-taupe-600">
          Dates added here will be completely unavailable on the booking form.
        </p>

        {/* Add blocked date form */}
        <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row gap-3 text-xs">
          <input
            type="date"
            required
            value={newBlocked.date}
            onChange={(e) => setNewBlocked({ ...newBlocked, date: e.target.value })}
            className="p-2.5 rounded-lg border border-champagne-300 bg-cream-50 font-medium"
          />
          <input
            type="text"
            placeholder="Reason (e.g. Bank Holiday, Studio Maintenance, Destination Wedding)..."
            value={newBlocked.reason}
            onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
            className="flex-1 p-2.5 rounded-lg border border-champagne-300 bg-cream-50"
          />
          <button
            type="submit"
            className="py-2.5 px-5 rounded-lg bg-espresso-900 text-cream-50 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Block Date</span>
          </button>
        </form>

        {/* Blocked Dates List */}
        <div className="pt-2">
          {blockedDates.length === 0 ? (
            <p className="text-xs text-taupe-500 py-3 text-center">
              No blocked dates currently registered.
            </p>
          ) : (
            <div className="divide-y divide-champagne-100">
              {blockedDates.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-espresso-950 font-semibold mr-3">
                      {item.date}
                    </strong>
                    <span className="text-taupe-600">{item.reason || 'Closed'}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBlockedDate(item.id)}
                    className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
