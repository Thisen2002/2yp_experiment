const express = require("express");
const cookieParser = require("cookie-parser");
const { randomUUID } = require("crypto");
const pool = require("../db");       // use local databbase

const router = express.Router();
const COOKIE_NAME = "userId";

// set/read anonymous user cookie
router.use(cookieParser());
router.use((req, res, next) => {
  let id = req.cookies?.[COOKIE_NAME];
  if (!id) {
    id = randomUUID();
    res.cookie(COOKIE_NAME, id, {
      httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 365, path: "/",
    });
  }
  req.userId = id;
  next();
});

// GET all categories
router.get("/categories", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT category_id, category_name 
      FROM categories 
      ORDER BY category_name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});



// GET my interests (with names)
router.get("/interests/me", async (req, res) => {
  try {
    // Get user's category IDs
    const userInterestsResult = await pool.query(`
      SELECT category_id 
      FROM interested_category 
      WHERE user_id = $1
    `, [req.userId]);

    const categoryIds = userInterestsResult.rows.map(r => r.category_id);
    
    if (!categoryIds.length) {
      return res.json({ user_id: req.userId, categories: [] });
    }

    // Get category names for those IDs
    const categoriesResult = await pool.query(`
      SELECT category_id, category_name 
      FROM categories 
      WHERE category_id = ANY($1)
    `, [categoryIds]);

    res.json({ 
      user_id: req.userId, 
      categories: categoriesResult.rows 
    });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    res.status(500).json({ error: "server error" });
  }
});


// POST replace my interests
router.post("/interests/me", async (req, res) => {
  try {
    const categories = Array.isArray(req.body?.categories)
      ? [...new Set(req.body.categories.map(String))]
      : [];

    // Start transaction
    await pool.query('BEGIN');

    // Clear current interests
    await pool.query(`
      DELETE FROM interested_category 
      WHERE user_id = $1
    `, [req.userId]);

    if (!categories.length) {
      await pool.query('COMMIT');
      return res.json({ user_id: req.userId, saved: [] });
    }

    // Insert new interests
    const insertQuery = `
      INSERT INTO interested_category (user_id, category_id) 
      VALUES ${categories.map((_, i) => `($1, $${i + 2})`).join(', ')}
    `;
    
    await pool.query(insertQuery, [req.userId, ...categories]);
    await pool.query('COMMIT');

    res.json({ user_id: req.userId, saved: categories });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating user interests:', error);
    res.status(500).json({ error: "server error" });
  }
});



// GET events matching selected categories, includes category names
router.get("/events/discover", async (req, res) => {
  try {
    const filterIds = String(req.query.categories || "")
      .split(",")
      .map(s => parseInt(s.trim()))
      .filter(id => !isNaN(id));
    
    if (!filterIds.length) {
      return res.json({ items: [], total: 0 });
    }

    // Get category names for the filter IDs
    const categoriesResult = await pool.query(`
      SELECT category_id, category_name
      FROM Categories
      WHERE category_id = ANY($1)
    `, [filterIds]);

    const categoryMap = {};
    categoriesResult.rows.forEach(row => {
      categoryMap[row.category_id] = row.category_name;
    });

    const categoryNames = Object.values(categoryMap);

    // Get events that have any of the specified categories in their event_categories array
    const eventsResult = await pool.query(`
      SELECT DISTINCT e.event_id, e.event_name, e.start_time, e.end_time, 
             e.description, e.location, e.event_categories
      FROM Events e
      WHERE e.event_categories && $1
      ORDER BY e.start_time ASC
    `, [categoryNames]);

    // const items = eventsResult.rows.map(event => ({
    //   ...event,
    //   categories: event.event_categories || []
    // }));

    const items = eventsResult.rows.map(event => ({
      ...event || []
    }));

    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Error discovering events:', error);
    res.status(500).json({ error: "server error" });
  }
});


// GET /api/events/recommended -> based on my saved interests
router.get("/events/recommended", async (req, res) => {
  try {
    // Get user's saved category IDs
    const userInterestsResult = await pool.query(`
      SELECT category_id 
      FROM interested_category 
      WHERE user_id = $1
    `, [req.userId]);

    const categoryIds = userInterestsResult.rows.map(r => r.category_id);
    
    if (!categoryIds.length) {
      return res.json({ items: [], total: 0 });
    }

    // Get category names for the user's interested category IDs
    const categoriesResult = await pool.query(`
      SELECT category_id, category_name
      FROM Categories
      WHERE category_id = ANY($1)
    `, [categoryIds]);

    const categoryMap = {};
    categoriesResult.rows.forEach(row => {
      categoryMap[row.category_id] = row.category_name;
    });

    const categoryNames = Object.values(categoryMap);

    // Get events that have any of the user's interested categories in their event_categories array
    const eventsResult = await pool.query(`
      SELECT DISTINCT e.event_id, e.event_name, e.start_time, e.end_time, 
             e.description, e.location, e.event_categories
      FROM Events e
      WHERE e.event_categories && $1
      ORDER BY e.start_time ASC
    `, [categoryNames]);

    // const items = eventsResult.rows.map(event => ({
    //   ...event,
    //   categories: event.event_categories || []
    // }));

    const items = eventsResult.rows.map(event => ({
      ...event || []
    }));


    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Error getting recommended events:', error);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
