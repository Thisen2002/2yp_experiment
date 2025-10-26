const express = require('express');
const pool = require('../db'); // Changed from supabase to pool

const router = express.Router();

// GET /api/events -> list all events with their categories
router.get('/', async (req, res) => {
    try {
        // Get all events with their categories from the event_categories array
        const result = await pool.query(`
            SELECT 
                e.event_id,
                e.event_name AS event_title,
                e.start_time,
                e.end_time,
                e.location,
                e.description,
                e.event_categories,
                e.interested_count,
                e.card_image_location
            FROM Events e
            ORDER BY e.start_time ASC
        `);

        // Map the results to include categories in the expected format
        const eventsWithCategories = result.rows.map(event => ({
            event_id: event.event_id,
            event_title: event.event_title,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location,
            description: event.description,
            categories: event.event_categories || [], // Use the array directly
            interested_count: event.interested_count || 0,
            card_image_location: event.card_image_location
        }));

        res.json(eventsWithCategories);
    } catch (err) {
        console.error('PostgreSQL fetch error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/events -> Create a new event
router.post('/', async (req, res) => {
    const {
        event_name,
        event_categories,
        start_time,
        end_time,
        location,
        description,
        card_image_location
    } = req.body;

    // Validation
    if (!event_name) {
        return res.status(400).json({ error: "event_name is required" });
    }
    if (!start_time || !end_time) {
        return res.status(400).json({ error: "start_time and end_time are required" });
    }

    try {
        // Convert categories to PostgreSQL array format if needed
        const categoriesArray = Array.isArray(event_categories) ? event_categories : [];

        const result = await pool.query(`
            INSERT INTO Events (
                event_name,
                event_categories,
                start_time,
                end_time,
                location,
                description,
                card_image_location,
                interested_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
            RETURNING *
        `, [
            event_name,
            categoriesArray,
            start_time,
            end_time,
            location || null,
            description || null,
            card_image_location || null
        ]);

        res.status(201).json({
            message: "Event created successfully",
            event: result.rows[0]
        });
    } catch (err) {
        console.error("❌ Error creating event:", err.message);
        res.status(500).json({ 
            error: "Failed to create event",
            details: err.message 
        });
    }
});

// PUT /api/events/:id -> Update an existing event
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    
    if (!Number.isFinite(idNum)) {
        return res.status(400).json({ error: "Invalid event id" });
    }

    const {
        event_name,
        event_categories,
        start_time,
        end_time,
        location,
        description,
        card_image_location
    } = req.body;

    try {
        // Check if event exists
        const checkResult = await pool.query(`
            SELECT event_id FROM Events WHERE event_id = $1
        `, [idNum]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Convert arrays if needed
        const categoriesArray = Array.isArray(event_categories) ? event_categories : null;

        const result = await pool.query(`
            UPDATE Events SET
                event_name = COALESCE($1, event_name),
                event_categories = COALESCE($2, event_categories),
                start_time = COALESCE($3, start_time),
                end_time = COALESCE($4, end_time),
                location = COALESCE($5, location),
                description = COALESCE($6, description),
                card_image_location = COALESCE($7, card_image_location)
            WHERE event_id = $8
            RETURNING *
        `, [
            event_name,
            categoriesArray,
            start_time,
            end_time,
            location,
            description,
            card_image_location,
            idNum
        ]);

        res.json({
            message: "Event updated successfully",
            event: result.rows[0]
        });
    } catch (err) {
        console.error("❌ Error updating event:", err.message);
        res.status(500).json({ 
            error: "Failed to update event",
            details: err.message 
        });
    }
});

// DELETE /api/events/:id -> Delete an event
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    
    if (!Number.isFinite(idNum)) {
        return res.status(400).json({ error: "Invalid event id" });
    }

    try {
        const result = await pool.query(`
            DELETE FROM Events WHERE event_id = $1 RETURNING *
        `, [idNum]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({
            message: "Event deleted successfully",
            event: result.rows[0]
        });
    } catch (err) {
        console.error("❌ Error deleting event:", err.message);
        res.status(500).json({ 
            error: "Failed to delete event",
            details: err.message 
        });
    }
});

module.exports = router;