const express = require('express');
const pool = require('../db');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /memories - create a memory with optional image (multipart/form-data)
router.post('/memories', upload.single('image'), async (req, res) => {
  const { title, note, created_by } = req.body;
  const userId = created_by || req.cookies?.userId || null;

  let imageObj = null;
  if (req.file && req.file.buffer) {
    try {
      const b64 = req.file.buffer.toString('base64');
      imageObj = { mime: req.file.mimetype, filename: req.file.originalname, data: b64 };
    } catch (e) {
      console.error('Failed to process uploaded memory image', e.message || e);
      return res.status(500).json({ error: 'Failed to process image' });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO memories (user_id, title, note, image) VALUES ($1,$2,$3,$4) RETURNING *`,
      [userId, title || null, note || null, imageObj]
    );
    res.status(201).json({ memory: result.rows[0] });
  } catch (err) {
    console.error('Failed to create memory', err.message || err);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// GET /memories - list memories (optional ?user_id= or ?limit=&offset=)
router.get('/memories', async (req, res) => {
  const { user_id, limit = 100, offset = 0 } = req.query;
  const params = [];
  const conds = [];
  if (user_id) {
    params.push(user_id);
    conds.push(`user_id = $${params.length}`);
  }
  params.push(Number(limit));
  params.push(Number(offset));

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const q = `SELECT * FROM memories ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  try {
    const r = await pool.query(q, params);
    res.json({ memories: r.rows });
  } catch (err) {
    console.error('Failed to list memories', err.message || err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// GET /memories/:id
router.get('/memories/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const r = await pool.query('SELECT * FROM memories WHERE id = $1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Failed to fetch memory', err.message || err);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

// DELETE /memories/:id
router.delete('/memories/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const r = await pool.query('DELETE FROM memories WHERE id = $1 RETURNING *', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, memory: r.rows[0] });
  } catch (err) {
    console.error('Failed to delete memory', err.message || err);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

module.exports = router;
