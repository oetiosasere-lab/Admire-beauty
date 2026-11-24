const { supabase, isConfigured, mockStore } = require('../config/supabase');

/**
 * Customer creates a support ticket
 */
const createTicket = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    const customerId = req.user.id;
    const customerEmail = req.user.email;
    const customerName = req.user.full_name || 'Client';

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          customer_id: customerId,
          customer_email: customerEmail,
          customer_name: customerName,
          subject,
          message,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    } else {
      const ticket = {
        id: `tkt-${Date.now()}`,
        customer_id: customerId,
        customer_email: customerEmail,
        customer_name: customerName,
        subject,
        message,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockStore.support_tickets.unshift(ticket);
      return res.status(201).json({ success: true, data: ticket });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Customer gets their own support tickets
 */
const getMyTickets = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const customerEmail = req.user.email;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          support_replies (*)
        `)
        .or(`customer_id.eq.${customerId},customer_email.eq.${customerEmail}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    } else {
      const tickets = mockStore.support_tickets.filter(
        (t) => t.customer_id === customerId || t.customer_email.toLowerCase() === customerEmail.toLowerCase()
      );

      const enriched = tickets.map((t) => ({
        ...t,
        support_replies: mockStore.support_replies.filter((r) => r.ticket_id === t.id),
      }));

      return res.json({ success: true, data: enriched });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get ticket details with replies thread
 */
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          support_replies (*)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Support ticket not found.' });
      }

      if (req.user.role !== 'admin' && data.customer_id !== req.user.id && data.customer_email !== req.user.email) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this ticket.' });
      }

      return res.json({ success: true, data });
    } else {
      const ticket = mockStore.support_tickets.find((t) => t.id === id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Support ticket not found.' });
      }

      const replies = mockStore.support_replies.filter((r) => r.ticket_id === id);
      return res.json({ success: true, data: { ...ticket, support_replies: replies } });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Add reply to support ticket
 */
const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (isConfigured && supabase) {
      const { data: ticket, error: tktErr } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (tktErr || !ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }

      const { data: reply, error: replyErr } = await supabase
        .from('support_replies')
        .insert({
          ticket_id: id,
          sender_id: req.user.id,
          sender_name: req.user.full_name || (isAdmin ? 'Admire Lead Artist' : 'Client'),
          is_admin: isAdmin,
          message,
        })
        .select()
        .single();

      if (replyErr) throw replyErr;

      // Update ticket status or updated_at
      const newStatus = isAdmin && ticket.status === 'open' ? 'in_progress' : ticket.status;
      await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      return res.status(201).json({ success: true, data: reply });
    } else {
      const ticket = mockStore.support_tickets.find((t) => t.id === id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }

      const reply = {
        id: `rep-${Date.now()}`,
        ticket_id: id,
        sender_id: req.user.id,
        sender_name: req.user.full_name || (isAdmin ? 'Admire Lead Artist' : 'Client'),
        is_admin: isAdmin,
        message,
        created_at: new Date().toISOString(),
      };
      mockStore.support_replies.push(reply);

      if (isAdmin && ticket.status === 'open') {
        ticket.status = 'in_progress';
      }
      ticket.updated_at = new Date().toISOString();

      return res.status(201).json({ success: true, data: reply });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  addReply,
};
