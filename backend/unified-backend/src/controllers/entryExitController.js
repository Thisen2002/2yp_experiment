const pool = require('../config/database');

// ==============================
// GET ALL ENTRY EXIT LOGS
// ==============================
const getEntryExitLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, building_id, visitor_id, date } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        eel.log_id, eel.visitor_id, eel.building_id, eel.entry_time, 
        eel.exit_time, eel.qr_code, eel.session_duration,
        v.visitor_name, b.building_name
      FROM entry_exit_log eel
      LEFT JOIN visitors v ON eel.visitor_id = v.visitor_id
      LEFT JOIN buildings b ON eel.building_id = b.building_id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;
    
    if (building_id) {
      paramCount++;
      query += ` AND eel.building_id = $${paramCount}`;
      params.push(building_id);
    }
    
    if (visitor_id) {
      paramCount++;
      query += ` AND eel.visitor_id = $${paramCount}`;
      params.push(visitor_id);
    }
    
    if (date) {
      paramCount++;
      query += ` AND DATE(eel.entry_time) = $${paramCount}`;
      params.push(date);
    }
    
    query += ` ORDER BY eel.entry_time DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching entry exit logs:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// CREATE ENTRY LOG (CHECK-IN)
// ==============================
const createEntry = async (req, res) => {
  const { visitor_id, building_id, qr_code } = req.body;

  if (!visitor_id || !building_id) {
    return res.status(400).json({ message: 'visitor_id and building_id are required' });
  }

  try {
    // Check if visitor exists
    const visitorCheck = await pool.query('SELECT visitor_id FROM visitors WHERE visitor_id = $1', [visitor_id]);
    if (visitorCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    // Check if building exists
    const buildingCheck = await pool.query('SELECT building_id FROM buildings WHERE building_id = $1', [building_id]);
    if (buildingCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Check if visitor is already checked in to this building
    const existingEntry = await pool.query(
      'SELECT log_id FROM entry_exit_log WHERE visitor_id = $1 AND building_id = $2 AND exit_time IS NULL',
      [visitor_id, building_id]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(409).json({ message: 'Visitor is already checked in to this building' });
    }

    const result = await pool.query(
      `INSERT INTO entry_exit_log (visitor_id, building_id, qr_code)
       VALUES ($1, $2, $3)
       RETURNING log_id, visitor_id, building_id, entry_time, qr_code`,
      [visitor_id, building_id, qr_code || null]
    );

    res.status(201).json({
      message: 'Entry logged successfully',
      entry: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating entry log:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// UPDATE EXIT LOG (CHECK-OUT)
// ==============================
const createExit = async (req, res) => {
  const { visitor_id, building_id } = req.body;

  if (!visitor_id || !building_id) {
    return res.status(400).json({ message: 'visitor_id and building_id are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE entry_exit_log
       SET exit_time = CURRENT_TIMESTAMP
       WHERE visitor_id = $1 AND building_id = $2 AND exit_time IS NULL
       RETURNING log_id, visitor_id, building_id, entry_time, exit_time, session_duration`,
      [visitor_id, building_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No active entry found for this visitor in this building' });
    }

    res.json({
      message: 'Exit logged successfully',
      entry: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating exit log:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GET CURRENT VISITORS IN BUILDING
// ==============================
const getCurrentVisitors = async (req, res) => {
  const { building_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        eel.log_id, eel.visitor_id, eel.entry_time, eel.qr_code,
        v.visitor_name, v.visitor_type
       FROM entry_exit_log eel
       JOIN visitors v ON eel.visitor_id = v.visitor_id
       WHERE eel.building_id = $1 AND eel.exit_time IS NULL
       ORDER BY eel.entry_time DESC`,
      [building_id]
    );

    res.json({
      building_id,
      current_visitors: result.rows,
      total_current: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching current visitors:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

module.exports = {
  getEntryExitLogs,
  createEntry,
  createExit,
  getCurrentVisitors
};