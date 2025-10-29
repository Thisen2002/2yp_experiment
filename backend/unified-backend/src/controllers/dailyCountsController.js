const pool = require('../config/database');

// ==============================
// GET DAILY VISITOR COUNTS
// ==============================
const getDailyCounts = async (req, res) => {
  try {
    const { building_id, start_date, end_date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        dvc.count_id, dvc.building_id, dvc.visit_date, 
        dvc.total_visitors, dvc.unique_visitors,
        b.building_name, b.building_capacity
      FROM daily_visitor_counts dvc
      JOIN buildings b ON dvc.building_id = b.building_id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;
    
    if (building_id) {
      paramCount++;
      query += ` AND dvc.building_id = $${paramCount}`;
      params.push(building_id);
    }
    
    if (start_date) {
      paramCount++;
      query += ` AND dvc.visit_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      query += ` AND dvc.visit_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    query += ` ORDER BY dvc.visit_date DESC, dvc.building_id LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching daily counts:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// CREATE/UPDATE DAILY COUNT
// ==============================
const createOrUpdateDailyCount = async (req, res) => {
  const { building_id, visit_date, total_visitors, unique_visitors } = req.body;

  if (!building_id || !visit_date || total_visitors === undefined) {
    return res.status(400).json({ 
      message: 'building_id, visit_date, and total_visitors are required' 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO daily_visitor_counts (building_id, visit_date, total_visitors, unique_visitors)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (building_id, visit_date) 
       DO UPDATE SET 
         total_visitors = $3,
         unique_visitors = $4,
         updated_at = CURRENT_TIMESTAMP
       RETURNING count_id, building_id, visit_date, total_visitors, unique_visitors`,
      [building_id, visit_date, total_visitors, unique_visitors || total_visitors]
    );

    res.json({
      message: 'Daily count saved successfully',
      count: result.rows[0]
    });
  } catch (err) {
    console.error('Error saving daily count:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GET VISITOR SUMMARY
// ==============================
const getVisitorSummary = async (req, res) => {
  try {
    const { period = '7' } = req.query; // Default to 7 days
    
    const query = `
      SELECT 
        b.building_id,
        b.building_name,
        SUM(dvc.total_visitors) as total_visitors,
        SUM(dvc.unique_visitors) as unique_visitors,
        AVG(dvc.total_visitors) as avg_daily_visitors,
        MAX(dvc.total_visitors) as peak_visitors,
        COUNT(dvc.visit_date) as days_with_data
      FROM buildings b
      LEFT JOIN daily_visitor_counts dvc ON b.building_id = dvc.building_id
        AND dvc.visit_date >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY b.building_id, b.building_name
      ORDER BY total_visitors DESC NULLS LAST
    `;
    
    const result = await pool.query(query);
    res.json({
      period_days: parseInt(period),
      summary: result.rows
    });
  } catch (err) {
    console.error('Error fetching visitor summary:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GENERATE DAILY COUNTS FROM LOGS
// ==============================
const generateDailyCountsFromLogs = async (req, res) => {
  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(`
      INSERT INTO daily_visitor_counts (building_id, visit_date, total_visitors, unique_visitors)
      SELECT 
        eel.building_id,
        $1::date as visit_date,
        COUNT(*) as total_visitors,
        COUNT(DISTINCT eel.visitor_id) as unique_visitors
      FROM entry_exit_log eel
      WHERE DATE(eel.entry_time) = $1::date
      GROUP BY eel.building_id
      ON CONFLICT (building_id, visit_date) 
      DO UPDATE SET 
        total_visitors = EXCLUDED.total_visitors,
        unique_visitors = EXCLUDED.unique_visitors,
        updated_at = CURRENT_TIMESTAMP
      RETURNING building_id, visit_date, total_visitors, unique_visitors
    `, [targetDate]);

    res.json({
      message: `Daily counts generated for ${targetDate}`,
      generated_counts: result.rows
    });
  } catch (err) {
    console.error('Error generating daily counts:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

module.exports = {
  getDailyCounts,
  createOrUpdateDailyCount,
  getVisitorSummary,
  generateDailyCountsFromLogs
};