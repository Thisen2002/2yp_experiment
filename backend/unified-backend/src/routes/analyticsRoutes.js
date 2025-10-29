const express = require("express");
const {
  getTotalVisitors,
  getTotalCheckIns,
  getAverageDuration,
  getRepeatVisitors,
  getTop3Buildings,
  getVisitorsPerBuilding
} = require("../controllers/analyticsController");

const router = express.Router();

// GET total visitors
router.get("/total-visitors", getTotalVisitors);

// GET total check-ins (real-time)
router.get("/total-checkins", getTotalCheckIns);

// GET average duration
router.get("/avg-duration", getAverageDuration);

// GET repeat visitors
router.get("/repeat-visitors", getRepeatVisitors);

// GET top 3 buildings ranked by visitors
router.get("/top3-buildings", getTop3Buildings);

// GET top 10 buildings ranked by visitors
router.get("/visitors-per-building", getVisitorsPerBuilding);

module.exports = router;