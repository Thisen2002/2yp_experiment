const express = require("express");
const pool = require("../db"); // <- your PostgreSQL pool connection

const router = express.Router();

const fieldMap = {
    title: "event_name",        // Changed from event_title to event_name
    description: "description",
    location: "location", 
    date: "start_time",
    start_time: "start_time",
    end_time: "end_time",
    categories: "event_categories",  // Added categories field
    card_image: "card_image_location" // Added card image field
};

// ------------------- EVENT ROUTES -------------------

// Get event details
router.get("/events/:id", async (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
        return res.status(400).json({ error: "Invalid event id" });
    }
    try {
        const result = await pool.query(`
            SELECT 
                event_id,
                event_name,
                description,
                location,
                start_time,
                end_time,
                card_image_location,
                event_categories
            FROM Events 
            WHERE event_id = $1
        `, [idNum]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error fetching event:", err.message);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});

// Get a specific field (title, description, etc.)
Object.keys(fieldMap).forEach((field) => {
    router.get(`/events/:id/${field}`, async (req, res) => {
        const { id } = req.params;
        const idNum = Number(id);
        if (!Number.isFinite(idNum)) {
            return res.status(400).json({ error: "Invalid event id" });
        }
        const selectField = fieldMap[field];
        try {
            const result = await pool.query(`
                SELECT ${selectField} 
                FROM Events 
                WHERE event_id = $1
            `, [idNum]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            let response = {};
            if (field === "date") {
                response.date = result.rows[0].start_time
                    ? result.rows[0].start_time.toISOString().split("T")[0]
                    : null;
            } else {
                response[field] = result.rows[0][selectField];
            }
            res.json(response);
        } catch (err) {
            console.error(`❌ Error fetching ${field}:`, err.message);
            res.status(500).json({ error: `Failed to fetch ${field}` });
        }
    });
});

// Event status (Upcoming, Ongoing, Ended)
router.get("/events/:id/status", async (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
        return res.status(400).json({ error: "Invalid event id" });
    }
    try {
        const result = await pool.query(`
            SELECT start_time, end_time 
            FROM Events 
            WHERE event_id = $1
        `, [idNum]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        const { start_time, end_time } = result.rows[0];
        const now = new Date();
        const start = new Date(start_time);
        const end = new Date(end_time);

        let status = "Upcoming";
        if (now >= start && now <= end) status = "Ongoing";
        else if (now > end) status = "Ended";

        res.json({ event_id: idNum, status });
    } catch (err) {
        console.error(`❌ Failed to fetch status for event ${id}:`, err.message);
        res.status(500).json({ error: "Failed to fetch event status" });
    }
});

// ------------------- INTERESTED EVENTS (Updated Schema) -------------------

// First, you need to create these tables:
// CREATE TABLE interested_events (
//     id SERIAL PRIMARY KEY,
//     user_id VARCHAR(255) NOT NULL,
//     event_id INTEGER NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
//     UNIQUE(user_id, event_id)
// );
//
// ALTER TABLE Events ADD COLUMN interested_count INTEGER DEFAULT 0;

// Mark event as interested
router.post("/interested", async (req, res) => {
    const { event_id } = req.body;
    const user_id = req.cookies.userId;
    
    if (!event_id) return res.status(400).json({ error: "event_id is required" });
    if (!user_id) return res.status(400).json({ error: "userId cookie is missing" });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if already interested
        const existing = await client.query(`
            SELECT id FROM interested_events 
            WHERE user_id = $1 AND event_id = $2
        `, [user_id, event_id]);

        if (existing.rows.length > 0) {
            // Get current count
            const countResult = await client.query(`
                SELECT interested_count FROM Events WHERE event_id = $1
            `, [event_id]);
            
            await client.query('COMMIT');
            return res.json({
                message: "Already marked as interested",
                interested_count: Number(countResult.rows[0]?.interested_count) || 0,
            });
        }

        // Insert interest record
        await client.query(`
            INSERT INTO interested_events (user_id, event_id) VALUES ($1, $2)
        `, [user_id, event_id]);

        // Update count
        const result = await client.query(`
            UPDATE Events 
            SET interested_count = COALESCE(interested_count, 0) + 1 
            WHERE event_id = $1 
            RETURNING interested_count
        `, [event_id]);

        await client.query('COMMIT');

        res.status(201).json({
            message: `Event ${event_id} marked as interested`,
            interested_count: Number(result.rows[0].interested_count) || 0,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Failed to mark interested:", err.message);
        res.status(500).json({ error: "Failed to mark event as interested" });
    } finally {
        client.release();
    }
});

// Remove interested
router.delete("/interested", async (req, res) => {
    const { event_id } = req.body;
    const user_id = req.cookies.userId;
    
    if (!event_id) return res.status(400).json({ error: "event_id is required" });
    if (!user_id) return res.status(400).json({ error: "userId cookie is missing" });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Remove interest record
        const deleteResult = await client.query(`
            DELETE FROM interested_events 
            WHERE user_id = $1 AND event_id = $2
        `, [user_id, event_id]);

        // Update count (only if something was deleted)
        if (deleteResult.rowCount > 0) {
            const result = await client.query(`
                UPDATE Events 
                SET interested_count = GREATEST(COALESCE(interested_count, 1) - 1, 0)
                WHERE event_id = $1 
                RETURNING interested_count
            `, [event_id]);
            
            await client.query('COMMIT');
            
            res.json({ 
                message: "Event removed from interested list", 
                interested_count: Number(result.rows[0].interested_count) || 0 
            });
        } else {
            await client.query('COMMIT');
            res.json({ 
                message: "Event was not in interested list", 
                interested_count: 0 
            });
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Failed to remove event:", err.message);
        res.status(500).json({ error: "Failed to remove event" });
    } finally {
        client.release();
    }
});

// Check interested status for a user
router.get("/interested/status/:event_id", async (req, res) => {
    const { event_id } = req.params;
    const user_id = req.cookies.userId;
    
    if (!event_id) return res.status(400).json({ error: "event_id is required" });
    if (!user_id) return res.status(400).json({ error: "userId cookie is missing" });

    try {
        const result = await pool.query(`
            SELECT id FROM interested_events 
            WHERE user_id = $1 AND event_id = $2
        `, [user_id, event_id]);

        const interested = result.rows.length > 0;
        res.json({ event_id: Number(event_id), interested });
    } catch (err) {
        console.error("❌ Failed to fetch interested status:", err.message);
        res.status(500).json({ error: "Failed to fetch interested status" });
    }
});

// Get all interested events of a user
router.get("/interested/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                ie.event_id,
                e.event_name,
                e.location,
                e.start_time,
                e.end_time
            FROM interested_events ie
            JOIN Events e ON ie.event_id = e.event_id
            WHERE ie.user_id = $1
            ORDER BY e.start_time
        `, [user_id]);

        res.json({ interestedEvents: result.rows });
    } catch (err) {
        console.error("❌ Failed to fetch interested events:", err.message);
        res.status(500).json({ error: "Failed to fetch interested events" });
    }
});

// Interested count
router.get("/events/:id/interested_counts", async (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
        return res.status(400).json({ error: "Invalid event id" });
    }
    try {
        const result = await pool.query(`
            SELECT interested_count FROM Events WHERE event_id = $1
        `, [idNum]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({
            event_id: idNum,
            interested_count: Number(result.rows[0].interested_count) || 0,
        });
    } catch (err) {
        console.error(`❌ Failed to fetch interested count for event ${id}:`, err.message);
        res.status(500).json({ error: "Failed to fetch interested count" });
    }
});

module.exports = router;