const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelMyBooking,
} = require('../controllers/bookingsController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/',
  optionalAuth,
  [
    body('service_id').notEmpty().withMessage('Service selection is required.'),
    body('appointment_date').isISO8601().withMessage('Valid appointment date (YYYY-MM-DD) is required.'),
    body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid start time required (HH:MM).'),
    body('full_name').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().withMessage('Valid email address is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    validate,
  ],
  createBooking
);

router.get('/my-bookings', requireAuth, getMyBookings);
router.get('/:id', optionalAuth, getBookingById);
router.patch('/:id/cancel', requireAuth, cancelMyBooking);

module.exports = router;
