const express = require('express');
const router = express.Router();
const dailyCountsController = require('../controllers/dailyCountsController');

// GET /api/daily-counts - Get daily visitor counts with filters
router.get('/', dailyCountsController.getDailyCounts);

// GET /api/daily-counts/summary - Get visitor summary
router.get('/summary', dailyCountsController.getVisitorSummary);

// POST /api/daily-counts - Create or update daily count
router.post('/', dailyCountsController.createOrUpdateDailyCount);

// POST /api/daily-counts/generate - Generate daily counts from logs
router.post('/generate', dailyCountsController.generateDailyCountsFromLogs);

module.exports = router;