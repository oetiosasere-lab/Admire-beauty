const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email address required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('full_name').trim().notEmpty().withMessage('Full name is required.'),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email address required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    validate,
  ],
  login
);

router.post('/logout', logout);

router.get('/me', requireAuth, getMe);

module.exports = router;
