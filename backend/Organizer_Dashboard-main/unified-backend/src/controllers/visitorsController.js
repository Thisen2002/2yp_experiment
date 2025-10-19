const pool = require('../config/database');

// ==============================
// GET ALL VISITORS
// ==============================
const getVisitors = async (req, res) => {
  try {
    const { page = 1, limit = 10, visitor_type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT visitor_id, visitor_name, email, phone, visitor_type, registration_time
      FROM visitors
    `;
    let params = [];
    
    if (visitor_type) {
      query += ` WHERE visitor_type = $1`;
      params.push(visitor_type);
    }
    
    query += ` ORDER BY registration_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    const countQuery = visitor_type 
      ? `SELECT COUNT(*) FROM visitors WHERE visitor_type = $1`
      : `SELECT COUNT(*) FROM visitors`;
    const countParams = visitor_type ? [visitor_type] : [];
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      visitors: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        totalVisitors: parseInt(countResult.rows[0].count)
      }
    });
  } catch (err) {
    console.error('Error fetching visitors:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GET VISITOR BY ID
// ==============================
const getVisitorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT visitor_id, visitor_name, email, phone, visitor_type, registration_time
       FROM visitors
       WHERE visitor_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching visitor:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// CREATE NEW VISITOR
// ==============================
const createVisitor = async (req, res) => {
  const { visitor_id, visitor_name, email, phone, visitor_type = 'general' } = req.body;

  if (!visitor_id || !visitor_name) {
    return res.status(400).json({ message: 'visitor_id and visitor_name are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO visitors (visitor_id, visitor_name, email, phone, visitor_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING visitor_id, visitor_name, email, phone, visitor_type, registration_time`,
      [visitor_id, visitor_name, email, phone, visitor_type]
    );

    res.status(201).json({
      message: 'Visitor created successfully',
      visitor: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ message: 'Visitor ID already exists' });
    }
    console.error('Error creating visitor:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// UPDATE VISITOR
// ==============================
const updateVisitor = async (req, res) => {
  const { id } = req.params;
  const { visitor_name, email, phone, visitor_type } = req.body;

  try {
    const result = await pool.query(
      `UPDATE visitors
       SET visitor_name = COALESCE($1, visitor_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           visitor_type = COALESCE($4, visitor_type)
       WHERE visitor_id = $5
       RETURNING visitor_id, visitor_name, email, phone, visitor_type, registration_time`,
      [visitor_name || null, email || null, phone || null, visitor_type || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json({
      message: 'Visitor updated successfully',
      visitor: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating visitor:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// DELETE VISITOR
// ==============================
const deleteVisitor = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM visitors
       WHERE visitor_id = $1
       RETURNING visitor_id, visitor_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json({
      message: 'Visitor deleted successfully',
      visitor: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting visitor:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

module.exports = {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor
};