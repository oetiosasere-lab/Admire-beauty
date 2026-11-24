const express = require('express');
const { getAllServices, getServiceById } = require('../controllers/servicesController');

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);

module.exports = router;
