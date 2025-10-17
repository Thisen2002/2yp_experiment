const express = require("express");
const cookieParser = require("cookie-parser");
const { randomUUID } = require("crypto");
const pool = require("../db"); // <- your PostgreSQL pool connection

const router = express.Router();

router.use(cookieParser());

// anonymous identity via cookie (no login)
router.use((req, res, next) => {
  const name = "visitorId";
  let id = req.cookies?.[name];
  if (!id) {
    id = randomUUID();
    res.cookie(name, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }
  req.visitorId = id;
  next();
});

// ----------------- POST /events/:eventId/ratings -----------------
router.post("/events/:eventId/ratings", async (req, res) => {
  const { eventId } = req.params;
  const { rating, comment } = req.body || {};
  const r = Number(rating);
  
  if (![1,2,3,4,5].includes(r)) {
    return res.status(400).json({ error: "rating must be 1..5" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert: Insert or update if exists (using ON CONFLICT)
    const result = await client.query(`
      INSERT INTO ratings (event_id, visitor_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (event_id, visitor_id)
      DO UPDATE SET 
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        created_at = CURRENT_TIMESTAMP
      RETURNING rating_id
    `, [eventId, req.visitorId, r, comment || null]);

    await client.query('COMMIT');
    
    return res.json({ 
      message: "Saved", 
      rating_id: result.rows[0].rating_id 
    });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("ratings upsert error:", e);
    return res.status(500).json({ error: "server error" });
  } finally {
    client.release();
  }
});

// ----------------- GET /events/:eventId/ratings/me -----------------
router.get("/events/:eventId/ratings/me", async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT rating, comment, created_at 
      FROM ratings 
      WHERE event_id = $1 AND visitor_id = $2
    `, [eventId, req.visitorId]);

    if (result.rows.length === 0) {
      return res.status(204).end();
    }

    const row = result.rows[0];
    return res.json({ 
      rating: row.rating, 
      comment: row.comment, 
      created_at: row.created_at 
    });
  } catch (e) {
    console.error("ratings/me error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

// ----------------- GET /events/:eventId/ratings/summary -----------------
router.get("/events/:eventId/ratings/summary", async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        AVG(rating::numeric) as average,
        COUNT(*) as count,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5
      FROM ratings 
      WHERE event_id = $1
    `, [eventId]);

    const row = result.rows[0];
    const count = parseInt(row.count);
    
    const histogram = {
      "1": parseInt(row.rating_1) || 0,
      "2": parseInt(row.rating_2) || 0,
      "3": parseInt(row.rating_3) || 0,
      "4": parseInt(row.rating_4) || 0,
      "5": parseInt(row.rating_5) || 0
    };

    const average = count > 0 ? Number(parseFloat(row.average).toFixed(2)) : null;

    return res.json({ average, count, histogram });
  } catch (e) {
    console.error("ratings/summary error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

// ----------------- DELETE /events/:eventId/ratings/me -----------------
router.delete("/events/:eventId/ratings/me", async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const result = await pool.query(`
      DELETE FROM ratings 
      WHERE event_id = $1 AND visitor_id = $2
    `, [eventId, req.visitorId]);

    return res.status(204).end();
  } catch (e) {
    console.error("ratings delete error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

// ----------------- GET /events/:eventId/ratings/all -----------------
router.get("/events/:eventId/ratings/all", async (req, res) => {
  const { eventId } = req.params;
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);

  try {
    // Get total count
    const countResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM ratings 
      WHERE event_id = $1
    `, [eventId]);

    // Get paginated results
    const result = await pool.query(`
      SELECT rating_id, event_id, visitor_id, rating, comment, created_at
      FROM ratings 
      WHERE event_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [eventId, limit, offset]);

    const items = result.rows.map(row => ({
      rating_id: row.rating_id,
      event_id: row.event_id,
      rating: row.rating,
      comment: row.comment,
      visitor: row.visitor_id,
      created_at: row.created_at
    }));

    res.json({
      total: parseInt(countResult.rows[0].total),
      items
    });
  } catch (e) {
    console.error("ratings/all error:", e);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;