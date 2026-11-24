import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Check,
  Edit2,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Selected booking modal state (for detail, admin notes, reschedule)
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (serviceFilter !== 'all') params.serviceId = serviceFilter;
      if (dateFilter) params.date = dateFilter;
      if (search) params.search = search;

      const [bksRes, srvRes] = await Promise.all([
        api.admin.getBookings(params),
        api.services.getAll(),
      ]);

      if (bksRes.success) setBookings(bksRes.data || []);
      if (srvRes.success) setServices(srvRes.data || []);
    } catch (err) {
      console.error('Error loading admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, serviceFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.admin.updateBooking(id, { status: newStatus });
      if (res.success) {
        setActionSuccess(`Booking updated to ${newStatus}.`);
        setTimeout(() => setActionSuccess(''), 3000);
        loadData();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(res.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Error updating booking status.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    try {
      const res = await api.admin.updateBooking(selectedBooking.id, {
        admin_notes: adminNotesText,
      });
      if (res.success) {
        setActionSuccess('Internal notes saved.');
        setTimeout(() => setActionSuccess(''), 3000);
        setSelectedBooking(res.data);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error saving notes.');
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !rescheduleData.date || !rescheduleData.time) {
      alert('Please select both a new appointment date and time.');
      return;
    }
    try {
      const res = await api.admin.updateBooking(selectedBooking.id, {
        appointment_date: rescheduleData.date,
        start_time: rescheduleData.time,
      });
      if (res.success) {
        setActionSuccess('Appointment rescheduled successfully.');
        setTimeout(() => setActionSuccess(''), 3000);
        setSelectedBooking(res.data);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error rescheduling appointment.');
    }
  };

  const openBookingDetail = (booking) => {
    setSelectedBooking(booking);
    setAdminNotesText(booking.admin_notes || '');
    setRescheduleData({ date: booking.appointment_date, time: booking.start_time });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-900 border-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      completed: 'bg-blue-100 text-blue-900 border-blue-300',
      cancelled: 'bg-stone-200 text-stone-700 border-stone-300',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
            Client Appointments
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
            Booking Management
          </h1>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-lg border border-champagne-300 hover:bg-champagne-100 text-taupe-700 flex items-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          ✓ {actionSuccess}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-champagne-300 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by client name, email or reference (e.g. AB-2026)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-5 bg-espresso-900 text-cream-50 rounded-xl text-xs font-semibold uppercase tracking-wider"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-champagne-100 text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-taupe-500 font-bold mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-champagne-300 bg-cream-50"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-taupe-500 font-bold mb-1">
              Service Filter
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-champagne-300 bg-cream-50"
            >
              <option value="all">All Makeup Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-taupe-500 font-bold mb-1">
              Date Filter
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-champagne-300 bg-cream-50"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-champagne-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/70 border-b border-champagne-200 text-taupe-600 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Client Details</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-taupe-500">
                    Loading booking records...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-taupe-500">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-espresso-950">
                      {booking.booking_reference}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-espresso-900">{booking.full_name}</p>
                      <p className="text-taupe-500 text-[11px]">{booking.email}</p>
                      <p className="text-taupe-500 text-[11px]">{booking.phone}</p>
                    </td>

                    <td className="p-4 font-medium text-espresso-900">
                      {booking.services?.name || 'Standard Makeup'}
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-espresso-900">
                        {booking.appointment_date}
                      </div>
                      <div className="text-taupe-500 text-[11px]">
                        {booking.start_time} – {booking.end_time}
                      </div>
                    </td>

                    <td className="p-4">{getStatusBadge(booking.status)}</td>

                    <td className="p-4 text-right space-x-1.5">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          title="Confirm Appointment"
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors inline-block"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'completed')}
                          title="Mark Completed"
                          className="p-1.5 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors inline-block"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          title="Cancel Booking"
                          className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-red-100 hover:text-red-700 transition-colors inline-block"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => openBookingDetail(booking)}
                        className="py-1 px-2.5 rounded-lg border border-champagne-300 text-espresso-900 hover:bg-champagne-100 text-[11px] font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail & Reschedule Drawer / Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-w-xl w-full bg-cream-50 rounded-2xl border border-champagne-300 shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-champagne-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-gold-700 font-bold">
                  {selectedBooking.booking_reference}
                </span>
                <h3 className="font-serif text-2xl font-medium text-espresso-950">
                  {selectedBooking.services?.name || 'Appointment'} Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-taupe-500 hover:text-espresso-950 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-white rounded-xl border border-champagne-200">
              <div>
                <span className="text-taupe-500 block">Client:</span>
                <strong className="text-espresso-900">{selectedBooking.full_name}</strong>
              </div>
              <div>
                <span className="text-taupe-500 block">Phone:</span>
                <a href={`tel:${selectedBooking.phone}`} className="text-gold-700 font-semibold">
                  {selectedBooking.phone}
                </a>
              </div>
              <div>
                <span className="text-taupe-500 block">Email:</span>
                <a href={`mailto:${selectedBooking.email}`} className="text-gold-700 font-semibold">
                  {selectedBooking.email}
                </a>
              </div>
              <div>
                <span className="text-taupe-500 block">Status:</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
            </div>

            {selectedBooking.message && (
              <div className="text-xs p-3 bg-champagne-50 rounded-xl border border-champagne-200">
                <span className="text-taupe-500 font-semibold block mb-0.5">Client Note:</span>
                <p className="italic text-espresso-900">"{selectedBooking.message}"</p>
              </div>
            )}

            {/* Reschedule Section */}
            <div className="space-y-2 pt-2 border-t border-champagne-200 text-xs">
              <span className="font-bold uppercase tracking-wider text-taupe-700 block">
                Reschedule Date & Time
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="p-2 rounded-lg border border-champagne-300 bg-white"
                />
                <input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  className="p-2 rounded-lg border border-champagne-300 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleReschedule}
                className="py-1.5 px-4 rounded-lg bg-espresso-900 text-cream-50 text-xs font-semibold hover:bg-espresso-950 transition-colors"
              >
                Apply Reschedule
              </button>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2 pt-2 border-t border-champagne-200 text-xs">
              <span className="font-bold uppercase tracking-wider text-taupe-700 block">
                Internal Administrative Notes
              </span>
              <textarea
                rows={3}
                placeholder="Private artist notes (deposit status, skin type, trial preferences)..."
                value={adminNotesText}
                onChange={(e) => setAdminNotesText(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="py-1.5 px-4 rounded-lg bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
