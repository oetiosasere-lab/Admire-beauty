const express = require('express');
const { body } = require('express-validator');
const {
  getDashboardOverview,
  getBookings,
  updateBooking,
  getCustomers,
  getAdminServices,
  createService,
  updateService,
  deleteService,
  getAdminAvailability,
  updateAvailabilitySchedule,
  addBlockedDate,
  deleteBlockedDate,
  getAdminSupportTickets,
  updateSupportTicketStatus,
  getAnalytics,
} = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Apply Authentication & Admin Authorization to all routes in this router
router.use(requireAuth, requireAdmin);

// Dashboard Overview
router.get('/dashboard', getDashboardOverview);

// Bookings Management
router.get('/bookings', getBookings);
router.patch('/bookings/:id', updateBooking);

// Customers Management
router.get('/customers', getCustomers);

// Services Management
router.get('/services', getAdminServices);
router.post(
  '/services',
  [
    body('name').trim().notEmpty().withMessage('Service name is required.'),
    body('price').isNumeric().withMessage('Valid price is required.'),
    body('duration').isNumeric().withMessage('Duration in minutes is required.'),
    validate,
  ],
  createService
);
router.patch('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Availability & Blocked Dates
router.get('/availability', getAdminAvailability);
router.post('/availability', updateAvailabilitySchedule);
router.post(
  '/blocked-dates',
  [body('date').isISO8601().withMessage('Valid date is required.'), validate],
  addBlockedDate
);
router.delete('/blocked-dates/:id', deleteBlockedDate);

// Support Management
router.get('/support/tickets', getAdminSupportTickets);
router.patch(
  '/support/tickets/:id',
  [
    body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status required.'),
    validate,
  ],
  updateSupportTicketStatus
);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
