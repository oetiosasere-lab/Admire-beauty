const express = require('express');
const { body } = require('express-validator');
const {
  createTicket,
  getMyTickets,
  getTicketById,
  addReply,
} = require('../controllers/supportController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/tickets',
  requireAuth,
  [
    body('subject').trim().notEmpty().withMessage('Subject is required.'),
    body('message').trim().notEmpty().withMessage('Message is required.'),
    validate,
  ],
  createTicket
);

router.get('/tickets', requireAuth, getMyTickets);
router.get('/tickets/:id', requireAuth, getTicketById);

router.post(
  '/tickets/:id/replies',
  requireAuth,
  [
    body('message').trim().notEmpty().withMessage('Reply message cannot be empty.'),
    validate,
  ],
  addReply
);

module.exports = router;
