const express = require('express');
const router = express.Router();
const PerformanceController = require('./controller');
const auth = require('../../shared/middleware/auth');
const tenant = require('../../shared/middleware/tenant');

// All performance routes require athlete:view permission
router.get('/roster', auth(['athlete:view']), tenant, PerformanceController.getRoster);
router.get('/athlete/:id', auth(['athlete:view']), tenant, PerformanceController.getAthleteDetail);

module.exports = router;
