const analyticsService = require("../services/analyticsService");

// 1. Total visitors in a building (count_per_day)
async function getTotalVisitors(req, res) {
  try {
    const { buildingId } = req.query;
    
    if (!buildingId) {
      return res.status(400).json({ error: "buildingId parameter is required" });
    }
    
    const data = await analyticsService.getTotalVisitors(buildingId);
    res.json(data);
  } catch (err) {
    console.error('Error in getTotalVisitors:', err);
    res.status(500).json({ error: "Failed to fetch total visitors", details: err.message });
  }
}

// 2. Total check-ins (real-time visitors in a building right now)
async function getTotalCheckIns(req, res) {
  try {
    const { buildingId } = req.query;
    
    if (!buildingId) {
      return res.status(400).json({ error: "buildingId parameter is required" });
    }
    
    const data = await analyticsService.getTotalCheckIns(buildingId);
    res.json(data);
  } catch (err) {
    console.error('Error in getTotalCheckIns:', err);
    res.status(500).json({ error: "Failed to fetch total check-ins", details: err.message });
  }
}

// 3. Average duration (use EntryExitLog if qr exists)
async function getAverageDuration(req, res) {
  try {
    const { buildingId, slot } = req.query;
    
    if (!buildingId) {
      return res.status(400).json({ error: "buildingId parameter is required" });
    }
    
    const data = await analyticsService.getAverageDuration(buildingId, slot);
    res.json(data);
  } catch (err) {
    console.error('Error in getAverageDuration:', err);
    res.status(500).json({ error: "Failed to fetch average duration", details: err.message });
  }
}

// 4. Repeat visitors (use EntryExitLog if qr exists)
async function getRepeatVisitors(req, res) {
  try {
    const { buildingId, slot } = req.query;
    
    if (!buildingId) {
      return res.status(400).json({ error: "buildingId parameter is required" });
    }
    
    const data = await analyticsService.getRepeatVisitors(buildingId, slot);
    res.json(data);
  } catch (err) {
    console.error('Error in getRepeatVisitors:', err);
    res.status(500).json({ error: "Failed to fetch repeat visitors", details: err.message });
  }
}

// 5. Top 3 buildings ranked by visitors
async function getTop3Buildings(req, res) {
  try {
    const data = await analyticsService.getTop3Buildings();
    res.json(data);
  } catch (err) {
    console.error('Error in getTop3Buildings:', err);
    res.status(500).json({ error: "Failed to fetch top 3 buildings", details: err.message });
  }
}

// 6. Top 10 buildings ranked by visitors
async function getVisitorsPerBuilding(req, res) {
  try {
    const data = await analyticsService.getVisitorsPerBuilding();
    res.json(data);
  } catch (err) {
    console.error('Error in getVisitorsPerBuilding:', err);
    res.status(500).json({ error: "Failed to fetch visitors per building", details: err.message });
  }
}

module.exports = {
  getTotalVisitors,
  getTotalCheckIns,
  getAverageDuration,
  getRepeatVisitors,
  getTop3Buildings,
  getVisitorsPerBuilding
};