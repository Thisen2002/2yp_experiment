const express = require('express');
const router = express.Router();
const entryExitController = require('../controllers/entryExitController');

// GET /api/entry-exit - Get all entry/exit logs with filters
router.get('/', entryExitController.getEntryExitLogs);

// POST /api/entry-exit/entry - Create entry log (check-in)
router.post('/entry', entryExitController.createEntry);

// POST /api/entry-exit/exit - Create exit log (check-out)
router.post('/exit', entryExitController.createExit);

// GET /api/entry-exit/current/:building_id - Get current visitors in building
router.get('/current/:building_id', entryExitController.getCurrentVisitors);

module.exports = router;