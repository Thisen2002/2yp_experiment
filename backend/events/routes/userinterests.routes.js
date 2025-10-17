const express = require("express");
const cookieParser = require("cookie-parser");
const { randomUUID } = require("crypto");
const pool = require("../db"); // <- your PostgreSQL pool connection

const router = express.Router();
const COOKIE_NAME = "userId";

// cookie attach
router.use(cookieParser());
router.use((req, res, next) => {
  let id = req.cookies?.[COOKIE_NAME];
  if (!id) {
    id = randomUUID();
    res.cookie(COOKIE_NAME, id, {
      httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 365, path: "/"
    });
  }
  req.userId = id;
  next();
});

// GET /interests/me
router.get("/me", async (req, res) => {
  try {
    // Get user's interested categories with category details
    const result = await pool.query(`
      SELECT ic.category_id, c.category_name
      FROM interested_category ic
      JOIN Categories c ON ic.category_id = c.category_id
      WHERE ic.user_id = $1
      ORDER BY c.category_name
    `, [req.userId]);

    res.json({ 
      user_id: req.userId, 
      categories: result.rows 
    });
  } catch (error) {
    console.error("❌ Error fetching user interests:", error.message);
    res.status(500).json({ error: "Failed to fetch user interests" });
  }
});

// POST /interests/me  {categories: ["1","3","5"]}
router.post("/me", async (req, res) => {
  const categories = Array.isArray(req.body?.categories)
    ? [...new Set(req.body.categories.map(Number).filter(n => Number.isInteger(n)))]
    : [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete existing interests
    await client.query(`
      DELETE FROM interested_category 
      WHERE user_id = $1
    `, [req.userId]);

    // Insert new interests if any
    if (categories.length > 0) {
      // Verify categories exist
      const validCategoriesResult = await client.query(`
        SELECT category_id 
        FROM Categories 
        WHERE category_id = ANY($1)
      `, [categories]);

      const validCategories = validCategoriesResult.rows.map(row => row.category_id);
      
      if (validCategories.length > 0) {
        // Insert valid categories
        const insertValues = validCategories.map((catId, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        const insertQuery = `
          INSERT INTO interested_category (user_id, category_id) 
          VALUES ${insertValues}
        `;
        
        await client.query(insertQuery, [req.userId, ...validCategories]);
      }

      await client.query('COMMIT');
      res.json({ 
        user_id: req.userId, 
        saved: validCategories,
        invalid: categories.filter(id => !validCategories.includes(id))
      });
    } else {
      await client.query('COMMIT');
      res.json({ user_id: req.userId, saved: [] });
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Error saving user interests:", error.message);
    res.status(500).json({ error: "Failed to save user interests" });
  } finally {
    client.release();
  }
});

// DELETE /interests/me  (clear all)
router.delete("/me", async (req, res) => {
  try {
    const result = await pool.query(`
      DELETE FROM interested_category 
      WHERE user_id = $1
    `, [req.userId]);

    res.json({ 
      user_id: req.userId, 
      deleted: true,
      count: result.rowCount 
    });
  } catch (error) {
    console.error("❌ Error deleting user interests:", error.message);
    res.status(500).json({ error: "Failed to delete user interests" });
  }
});

// GET /interests/categories
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category_id, category_name, description
      FROM Categories 
      ORDER BY category_name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching categories:", error.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Bonus: GET /interests/categories/:id/users (get users interested in a category)
router.get("/categories/:id/users", async (req, res) => {
  const categoryId = Number(req.params.id);
  
  if (!Number.isInteger(categoryId)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  try {
    const result = await pool.query(`
      SELECT 
        ic.user_id,
        ic.created_at,
        c.category_name
      FROM interested_category ic
      JOIN Categories c ON ic.category_id = c.category_id
      WHERE ic.category_id = $1
      ORDER BY ic.created_at DESC
    `, [categoryId]);

    res.json({
      category_id: categoryId,
      category_name: result.rows[0]?.category_name || null,
      users: result.rows.map(row => ({
        user_id: row.user_id,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    console.error("❌ Error fetching category users:", error.message);
    res.status(500).json({ error: "Failed to fetch category users" });
  }
});

module.exports = router;