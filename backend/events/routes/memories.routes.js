const express = require('express');
const pool = require('../db');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const axios = require('axios');

// AI generation config 
const IMAGE_AI_SERVICE_URL = process.env.IMAGE_AI_SERVICE_URL || null;
const IMAGE_AI_API_KEY = process.env.IMAGE_AI_API_KEY || null;

// POST /memories - create a memory with 
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
// Returns aggregated vote counts (upvotes, downvotes, score) joined into each memory row
router.get('/memories', async (req, res) => {
  const { user_id, limit = 100, offset = 0, approved } = req.query;
  const params = [];
  const conds = [];
  if (user_id) {
    params.push(user_id);
    conds.push(`m.user_id = $${params.length}`);
  }
  // approval filtering: by default only approved memories are returned; pass approved=all to see all
  if (typeof approved === 'undefined') {
    conds.push(`m.approved = true`);
  } else if (approved !== 'all') {
    const appVal = (approved === 'true' || approved === '1');
    params.push(appVal);
    conds.push(`m.approved = $${params.length}`);
  }

  params.push(Number(limit));
  params.push(Number(offset));

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  // Aggregate votes per memory: upvotes, downvotes, score
  const q = `
    SELECT m.*, COALESCE(v.upvotes,0) AS upvotes, COALESCE(v.downvotes,0) AS downvotes, COALESCE(v.score,0) AS score
    FROM memories m
    LEFT JOIN (
      SELECT memory_id,
        SUM(CASE WHEN value > 0 THEN 1 ELSE 0 END) AS upvotes,
        SUM(CASE WHEN value < 0 THEN 1 ELSE 0 END) AS downvotes,
        SUM(value) AS score
      FROM memory_votes
      GROUP BY memory_id
    ) v ON v.memory_id = m.id
    ${where}
    ORDER BY m.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  try {
    const r = await pool.query(q, params);
    res.json({ memories: r.rows });
  } catch (err) {
    console.error('Failed to list memories', err.message || err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// POST /memories/:id/approve - approve a memory (admin)
router.post('/memories/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const approver = req.body?.approved_by || req.cookies?.userId || null;
  try {
    const r = await pool.query(
      'UPDATE memories SET approved = true, approved_by = $2, approved_at = now() WHERE id = $1 RETURNING *',
      [id, approver]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Memory not found' });
    res.json({ memory: r.rows[0] });
  } catch (err) {
    console.error('Failed to approve memory', err.message || err);
    res.status(500).json({ error: 'Failed to approve memory' });
  }
});

// POST /memories/:id/reject - unapprove/reject a memory (admin)
router.post('/memories/:id/reject', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const r = await pool.query(
      'UPDATE memories SET approved = false, approved_by = NULL, approved_at = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Memory not found' });
    res.json({ memory: r.rows[0] });
  } catch (err) {
    console.error('Failed to reject memory', err.message || err);
    res.status(500).json({ error: 'Failed to reject memory' });
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

// POST /memories/generate - generate a stylized variant of an uploaded image using a configured AI service
// Accepts multipart/form-data with field 'image' (file) and 'style' (string)
router.post('/memories/generate', upload.single('image'), async (req, res) => {
  const style = req.body.style || 'default';

  if (!IMAGE_AI_SERVICE_URL) return res.status(501).json({ error: 'Image AI service not configured' });

  // require an image file
  if (!req.file || !req.file.buffer) return res.status(400).json({ error: 'No image uploaded' });

  const base64 = req.file.buffer.toString('base64');

  try {
    // Forward to external AI service. The external API contract is assumed to accept JSON { image_base64, style }
    const payload = { image_base64: base64, style };
    const headers = { 'Content-Type': 'application/json' };
    if (IMAGE_AI_API_KEY) headers['Authorization'] = `Bearer ${IMAGE_AI_API_KEY}`;

    const aiRes = await axios.post(IMAGE_AI_SERVICE_URL, payload, { headers, timeout: 120000 });

    // Expecting response { image_base64: '...' } or { data: { image_base64: '...' } }
    const aiData = aiRes.data || {};
    const resultBase64 = aiData.image_base64 || (aiData.data && aiData.data.image_base64) || null;
    if (!resultBase64) {
      console.error('AI service returned unexpected response', aiRes.data);
      return res.status(502).json({ error: 'AI service returned unexpected response' });
    }

    // Return generated image (base64) to client
    res.json({ generated: { mime: req.file.mimetype, data: resultBase64, filename: `generated_${style}.${req.file.originalname.split('.').pop() || 'jpg'}` } });
  } catch (err) {
    console.error('AI generation failed', err.message || err, err.response && err.response.data);
    res.status(502).json({ error: 'AI generation failed', details: err.message || err });
  }
});

// POST /memories/:id/generate - generate variant from existing memory's image
router.post('/memories/:id/generate', async (req, res) => {
  const id = Number(req.params.id);
  const style = req.body.style || 'default';
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  if (!IMAGE_AI_SERVICE_URL) return res.status(501).json({ error: 'Image AI service not configured' });

  try {
    const r = await pool.query('SELECT * FROM memories WHERE id = $1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Memory not found' });
    const mem = r.rows[0];
    if (!mem.image || !mem.image.data) return res.status(400).json({ error: 'Memory has no image to generate from' });

    const payload = { image_base64: mem.image.data, style };
    const headers = { 'Content-Type': 'application/json' };
    if (IMAGE_AI_API_KEY) headers['Authorization'] = `Bearer ${IMAGE_AI_API_KEY}`;

    const aiRes = await axios.post(IMAGE_AI_SERVICE_URL, payload, { headers, timeout: 120000 });
    const aiData = aiRes.data || {};
    const resultBase64 = aiData.image_base64 || (aiData.data && aiData.data.image_base64) || null;
    if (!resultBase64) return res.status(502).json({ error: 'AI service returned unexpected response' });

    res.json({ generated: { mime: mem.image.mime || 'image/png', data: resultBase64, filename: `generated_${style}.${mem.image.filename?.split('.').pop() || 'jpg'}` } });
  } catch (err) {
    console.error('AI generation from memory failed', err.message || err, err.response && err.response.data);
    res.status(502).json({ error: 'AI generation failed', details: err.message || err });
  }
});

module.exports = router;

// POST /memories/:id/vote - cast or update a vote on a memory (expects JSON { value: 1 | -1 })
router.post('/memories/:id/vote', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const value = Number(req.body?.value);
  if (![1, -1].includes(value)) return res.status(400).json({ error: 'Invalid vote value' });

  const userId = req.body.user_id || req.cookies?.userId || null;
  try {
    // ensure memory exists
    const mem = await pool.query('SELECT id FROM memories WHERE id = $1', [id]);
    if (mem.rows.length === 0) return res.status(404).json({ error: 'Memory not found' });

    // Upsert vote by (memory_id, user_id). If userId is null we allow anonymous votes but store user_id as NULL
    const q = `
      INSERT INTO memory_votes (memory_id, user_id, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (memory_id, user_id) DO UPDATE SET value = EXCLUDED.value, created_at = now()
      RETURNING *
    `;
    const r = await pool.query(q, [id, userId, value]);

    // Return updated counts for the memory
    const agg = await pool.query(
      `SELECT SUM(CASE WHEN value>0 THEN 1 ELSE 0 END) AS upvotes, SUM(CASE WHEN value<0 THEN 1 ELSE 0 END) AS downvotes, SUM(value) AS score FROM memory_votes WHERE memory_id = $1`,
      [id]
    );
    const counts = agg.rows[0] || { upvotes: 0, downvotes: 0, score: 0 };
    res.json({ vote: r.rows[0], counts });
  } catch (err) {
    console.error('Failed to record vote', err.message || err);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

