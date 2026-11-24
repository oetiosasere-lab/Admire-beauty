import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getSupportTickets(statusFilter !== 'all' ? { status: statusFilter } : {});
      if (res.success && res.data) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await api.admin.updateTicketStatus(ticketId, newStatus);
      if (res.success) {
        setFeedback(`Ticket marked as ${newStatus}.`);
        setTimeout(() => setFeedback(''), 3000);
        loadTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const res = await api.support.reply(selectedTicket.id, replyText.trim());
      if (res.success) {
        setReplyText('');
        setFeedback('Response sent to client.');
        setTimeout(() => setFeedback(''), 3000);
        // Refresh ticket details
        const refreshed = await api.support.getById(selectedTicket.id);
        if (refreshed.data) setSelectedTicket(refreshed.data);
        loadTickets();
      }
    } catch (err) {
      alert(err.message || 'Error posting reply.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-amber-100 text-amber-900 border-amber-300',
      in_progress: 'bg-blue-100 text-blue-900 border-blue-300',
      resolved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      closed: 'bg-stone-200 text-stone-700 border-stone-300',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          styles[status] || styles.open
        }`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
            Customer Inquiries & Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
            Support Helpdesk
          </h1>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-taupe-500 font-bold uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-champagne-300 bg-white"
          >
            <option value="all">All Inquiries</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          ✓ {feedback}
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-champagne-300 shadow-sm divide-y divide-champagne-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-taupe-500">
            Loading support threads...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-taupe-500">
            No support requests found matching current filter.
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="p-5 hover:bg-cream-50/60 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  {getStatusBadge(ticket.status)}
                  <span className="text-xs text-taupe-400">•</span>
                  <span className="text-xs text-taupe-500 font-semibold">
                    {ticket.customer_name} ({ticket.customer_email})
                  </span>
                  <span className="text-xs text-taupe-400">•</span>
                  <span className="text-xs text-taupe-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-medium text-espresso-950">
                  {ticket.subject}
                </h3>
                <p className="text-xs text-taupe-600 line-clamp-1">{ticket.message}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gold-700 font-semibold">
                  {ticket.support_replies?.length || 0} response(s)
                </span>
                <button
                  type="button"
                  className="py-1 px-3 rounded-lg border border-champagne-300 bg-cream-50 text-xs font-semibold text-espresso-900 hover:bg-champagne-100"
                >
                  Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Response Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-sm"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="max-w-2xl w-full bg-cream-50 rounded-2xl border border-champagne-300 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-champagne-200 bg-cream-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold-700 font-bold block">
                  Support Ticket #{selectedTicket.id.slice(0, 8)}
                </span>
                <h3 className="font-serif text-2xl font-medium text-espresso-950">
                  {selectedTicket.subject}
                </h3>
                <p className="text-xs text-taupe-600">
                  Client: {selectedTicket.customer_name} ({selectedTicket.customer_email})
                </p>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="text-taupe-500 hover:text-espresso-950 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Status change actions */}
            <div className="px-6 py-3 bg-white border-b border-champagne-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-taupe-700">Set Status:</span>
              <div className="flex gap-1.5">
                {['open', 'in_progress', 'resolved', 'closed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedTicket.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                      selectedTicket.status === st
                        ? 'bg-espresso-900 text-cream-50 border-espresso-950'
                        : 'bg-cream-50 text-taupe-700 border-champagne-300 hover:bg-champagne-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="p-6 max-h-[45vh] overflow-y-auto space-y-3">
              {/* Original Client Message */}
              <div className="p-4 bg-white rounded-xl border border-champagne-200 text-xs space-y-1">
                <div className="flex justify-between text-taupe-500">
                  <strong>{selectedTicket.customer_name} (Client)</strong>
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
                  className={`p-4 rounded-xl text-xs space-y-1 ${
                    reply.is_admin
                      ? 'bg-champagne-100/80 border border-gold-300 ml-6'
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
            <form onSubmit={handleSendReply} className="p-4 bg-cream-100 border-t border-champagne-200 flex gap-2">
              <input
                type="text"
                required
                placeholder="Type your official studio response to client..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <button
                type="submit"
                className="py-2 px-5 rounded-lg bg-espresso-900 text-cream-50 text-xs font-semibold hover:bg-espresso-950 transition-colors flex items-center gap-1.5"
              >
                <span>Send Reply</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
