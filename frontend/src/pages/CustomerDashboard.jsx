import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Send,
  User,
  ShieldAlert,
} from 'lucide-react';

export const CustomerDashboard = ({ onOpenBooking }) => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTabQuery = searchParams.get('tab') || 'appointments';
  const [activeTab, setActiveTab] = useState(activeTabQuery);

  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [newTicketData, setNewTicketData] = useState({ subject: '', message: '' });
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'info' });

  useEffect(() => {
    if (activeTabQuery) {
      setActiveTab(activeTabQuery);
    }
  }, [activeTabQuery]);

  const fetchClientData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [bksRes, tktRes] = await Promise.all([
        api.bookings.getMyBookings().catch(() => ({ data: [] })),
        api.support.getMyTickets().catch(() => ({ data: [] })),
      ]);

      if (bksRes?.data) setBookings(bksRes.data);
      if (tktRes?.data) setTickets(tktRes.data);
    } catch (err) {
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [isAuthenticated]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you wish to cancel this appointment request?')) return;
    try {
      const res = await api.bookings.cancel(bookingId);
      if (res.success) {
        setActionMessage({ text: 'Booking successfully cancelled.', type: 'success' });
        fetchClientData();
      }
    } catch (err) {
      setActionMessage({ text: err.message || 'Could not cancel booking.', type: 'error' });
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketData.subject || !newTicketData.message) return;
    try {
      const res = await api.support.create(newTicketData);
      if (res.success) {
        setTicketModalOpen(false);
        setNewTicketData({ subject: '', message: '' });
        setActionMessage({ text: 'Support ticket submitted to our studio concierge.', type: 'success' });
        fetchClientData();
      }
    } catch (err) {
      setActionMessage({ text: err.message || 'Failed to submit ticket.', type: 'error' });
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicket) return;
    try {
      const res = await api.support.reply(selectedTicket.id, ticketReplyText.trim());
      if (res.success) {
        setTicketReplyText('');
        // Refresh ticket details
        const refreshed = await api.support.getById(selectedTicket.id);
        if (refreshed.data) setSelectedTicket(refreshed.data);
        fetchClientData();
      }
    } catch (err) {
      alert(err.message || 'Error posting message reply.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center pt-28 pb-16 px-4">
        <div className="max-w-md w-full bg-cream-50 p-8 rounded-2xl border border-champagne-300 shadow-luxury text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-gold-600 mx-auto" />
          <h2 className="font-serif text-3xl font-medium text-espresso-950">
            Client Authentication Required
          </h2>
          <p className="text-sm text-taupe-600 leading-relaxed font-light">
            Please sign in or register to access your appointments and private concierge support.
          </p>
          <button
            onClick={() => openAuth('login')}
            className="w-full py-3 px-6 rounded-full bg-espresso-900 text-cream-50 text-xs font-semibold uppercase tracking-wider hover:bg-espresso-950 transition-all"
          >
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-900 border-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      completed: 'bg-blue-100 text-blue-900 border-blue-300',
      cancelled: 'bg-stone-200 text-stone-700 border-stone-300',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Profile Banner */}
        <div className="bg-cream-50 rounded-2xl border border-champagne-300 p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-champagne-200 border border-gold-300 flex items-center justify-center text-gold-900 font-serif text-2xl font-bold">
              {user.full_name ? user.full_name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gold-600 font-semibold">
                Client Portal
              </span>
              <h1 className="font-serif text-3xl font-medium text-espresso-950">
                Welcome back, {user.full_name}
              </h1>
              <p className="text-xs text-taupe-500">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onOpenBooking}
            className="py-2.5 px-6 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            Book New Service
          </button>
        </div>

        {/* Action feedback alert */}
        {actionMessage.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center justify-between border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage({ text: '', type: 'info' })}
              className="font-bold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex border-b border-champagne-300 mb-8 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'appointments'
                ? 'border-gold-600 text-espresso-950'
                : 'border-transparent text-taupe-500 hover:text-espresso-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Appointments ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'support'
                ? 'border-gold-600 text-espresso-950'
                : 'border-transparent text-taupe-500 hover:text-espresso-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Helpdesk ({tickets.length})</span>
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {loading ? (
              <div className="p-12 text-center text-sm text-taupe-500 bg-cream-50 rounded-2xl border border-champagne-200">
                Loading your appointments...
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center bg-cream-50 rounded-2xl border border-champagne-200 space-y-4">
                <Calendar className="w-10 h-10 text-taupe-400 mx-auto" />
                <h3 className="font-serif text-2xl font-medium text-espresso-950">
                  No Appointments Scheduled Yet
                </h3>
                <p className="text-xs sm:text-sm text-taupe-600 max-w-md mx-auto">
                  Ready for your special day or celebration? Explore our signature glam and bridal packages.
                </p>
                <button
                  onClick={onOpenBooking}
                  className="py-2.5 px-6 rounded-full bg-espresso-900 text-cream-50 text-xs font-semibold uppercase tracking-wider"
                >
                  Schedule Your First Appointment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl p-6 border border-champagne-200 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-taupe-500 font-bold tracking-wider uppercase block">
                            Ref: {booking.booking_reference}
                          </span>
                          <h4 className="font-serif text-2xl font-medium text-espresso-950 mt-0.5">
                            {booking.services?.name || 'Makeup Appointment'}
                          </h4>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="p-3 bg-champagne-50 rounded-xl space-y-1.5 text-xs text-taupe-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          <span className="font-medium">
                            Date: {booking.appointment_date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gold-600" />
                          <span>
                            Time: {booking.start_time} – {booking.end_time}
                          </span>
                        </div>
                      </div>

                      {booking.message && (
                        <p className="text-xs text-taupe-600 italic">
                          "{booking.message}"
                        </p>
                      )}

                      {booking.admin_notes && (
                        <div className="p-2.5 bg-gold-50/70 border border-gold-200 rounded-lg text-xs text-gold-900">
                          <strong>Note from Artist:</strong> {booking.admin_notes}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-champagne-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-taupe-500">Service Fee: </span>
                        <strong className="text-espresso-950 font-serif text-base">
                          £{parseFloat(booking.services?.price || 0).toFixed(2)}
                        </strong>
                      </div>

                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUPPORT HELPDESK */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-2xl font-medium text-espresso-950">
                  Concierge Support
                </h3>
                <p className="text-xs text-taupe-600">
                  Direct communication regarding skin prep, rescheduling, or event inquiries.
                </p>
              </div>

              <button
                onClick={() => setTicketModalOpen(true)}
                className="py-2 px-4 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-taupe-500 bg-cream-50 rounded-xl">
                Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center bg-cream-50 rounded-2xl border border-champagne-200 space-y-3">
                <HelpCircle className="w-10 h-10 text-taupe-400 mx-auto" />
                <h4 className="font-serif text-xl font-medium text-espresso-950">
                  No Support Requests
                </h4>
                <p className="text-xs text-taupe-600 max-w-sm mx-auto">
                  Have a question about an upcoming trial or need special skin accommodations? Open a ticket anytime.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    onClick={() => setSelectedTicket(tkt)}
                    className="p-5 bg-white rounded-xl border border-champagne-200 hover:border-gold-400 cursor-pointer shadow-sm transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs uppercase tracking-wider font-bold text-gold-700">
                          {tkt.status}
                        </span>
                        <span className="text-xs text-taupe-400">•</span>
                        <span className="text-xs text-taupe-500">
                          {new Date(tkt.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-medium text-espresso-950">
                        {tkt.subject}
                      </h4>
                      <p className="text-xs text-taupe-600 line-clamp-1">
                        {tkt.message}
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-gold-600 hover:underline">
                      View Thread ({tkt.support_replies?.length || 0}) →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Thread Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-sm"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="max-w-xl w-full bg-cream-50 rounded-2xl border border-champagne-300 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-champagne-200 bg-cream-100/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold-600 font-semibold">
                  Status: {selectedTicket.status}
                </span>
                <h3 className="font-serif text-2xl font-medium text-espresso-950">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-taupe-500 hover:text-espresso-950"
              >
                ✕
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
              {/* Original User Message */}
              <div className="p-4 bg-white rounded-xl border border-champagne-200 text-xs space-y-1.5">
                <div className="flex justify-between text-taupe-500">
                  <strong>{selectedTicket.customer_name} (You)</strong>
                  <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <p className="text-espresso-900 leading-relaxed font-light">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Replies */}
              {(selectedTicket.support_replies || []).map((reply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-xl text-xs space-y-1.5 ${
                    reply.is_admin
                      ? 'bg-champagne-100/80 border border-gold-300 ml-4'
                      : 'bg-white border border-champagne-200'
                  }`}
                >
                  <div className="flex justify-between text-taupe-600">
                    <strong>{reply.sender_name} {reply.is_admin ? '(Admire Lead Artist)' : ''}</strong>
                    <span>{new Date(reply.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-espresso-900 leading-relaxed font-light">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendTicketReply} className="p-4 bg-cream-100 border-t border-champagne-200 flex gap-2">
              <input
                type="text"
                required
                placeholder="Type your response to the studio..."
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-lg bg-espresso-900 text-cream-50 text-xs font-semibold hover:bg-espresso-950 transition-colors flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Ticket Creation Modal */}
      {ticketModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-sm"
          onClick={() => setTicketModalOpen(false)}
        >
          <div
            className="max-w-md w-full bg-cream-50 rounded-2xl border border-champagne-300 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl font-medium text-espresso-950 mb-1">
              Submit Support Request
            </h3>
            <p className="text-xs text-taupe-600 mb-4">
              Our studio team reviews and responds to client inquiries promptly.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question on Bridal trial lashes"
                  value={newTicketData.subject}
                  onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your question or request..."
                  value={newTicketData.message}
                  onChange={(e) => setNewTicketData({ ...newTicketData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="py-2 px-4 rounded-lg text-xs font-medium text-taupe-600 hover:text-espresso-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg bg-espresso-900 text-cream-50 text-xs font-semibold uppercase tracking-wider"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
