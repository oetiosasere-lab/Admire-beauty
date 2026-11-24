const express = require('express');
const { getAvailability, getBlockedDates } = require('../controllers/availabilityController');

const router = express.Router();

router.get('/', getAvailability);
router.get('/blocked-dates', getBlockedDates);

module.exports = router;
