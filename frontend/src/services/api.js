const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Common request wrapper with JSON handling and auth token injection
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('admire_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
};

export const api = {
  // Authentication
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    getMe: () => request('/auth/me'),
  },

  // Services
  services: {
    getAll: () => request('/services'),
    getById: (id) => request(`/services/${id}`),
  },

  // Availability & Slots
  availability: {
    getWeekly: () => request('/availability'),
    getSlotsForDate: (date, serviceId) =>
      request(`/availability?date=${date}${serviceId ? `&serviceId=${serviceId}` : ''}`),
    getBlockedDates: () => request('/availability/blocked-dates'),
  },

  // Bookings
  bookings: {
    create: (bookingData) => request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
    getMyBookings: () => request('/bookings/my-bookings'),
    getById: (id) => request(`/bookings/${id}`),
    cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  },

  // Support Tickets
  support: {
    create: (ticketData) => request('/support/tickets', { method: 'POST', body: JSON.stringify(ticketData) }),
    getMyTickets: () => request('/support/tickets'),
    getById: (id) => request(`/support/tickets/${id}`),
    reply: (id, message) => request(`/support/tickets/${id}/replies`, { method: 'POST', body: JSON.stringify({ message }) }),
  },

  // Admin Operations
  admin: {
    getOverview: () => request('/admin/dashboard'),
    getBookings: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/bookings${qs ? `?${qs}` : ''}`);
    },
    updateBooking: (id, updates) => request(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    getCustomers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/customers${qs ? `?${qs}` : ''}`);
    },
    getServices: () => request('/admin/services'),
    createService: (serviceData) => request('/admin/services', { method: 'POST', body: JSON.stringify(serviceData) }),
    updateService: (id, serviceData) => request(`/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify(serviceData) }),
    deleteService: (id) => request(`/admin/services/${id}`, { method: 'DELETE' }),
    getAvailability: () => request('/admin/availability'),
    updateAvailability: (schedules) => request('/admin/availability', { method: 'POST', body: JSON.stringify({ schedules }) }),
    addBlockedDate: (dateData) => request('/admin/blocked-dates', { method: 'POST', body: JSON.stringify(dateData) }),
    deleteBlockedDate: (id) => request(`/admin/blocked-dates/${id}`, { method: 'DELETE' }),
    getSupportTickets: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/support/tickets${qs ? `?${qs}` : ''}`);
    },
    updateTicketStatus: (id, status) => request(`/admin/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getAnalytics: () => request('/admin/analytics'),
  },
};
