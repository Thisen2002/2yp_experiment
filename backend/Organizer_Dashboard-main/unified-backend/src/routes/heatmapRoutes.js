const express = require('express');
const router = express.Router();
const {
  getPeakOccupancy,
  getAvgDwellTime,
  getActivityLevel
} = require('../controllers/heatmapController');

router.get('/peak-occupancy', getPeakOccupancy);
router.get('/avg-dwell-time', getAvgDwellTime);
router.get('/activity-level', getActivityLevel);

router.get('/test', (req, res) => {
  res.json({ message: 'Heatmap API is reachable' });
});

module.exports = router;