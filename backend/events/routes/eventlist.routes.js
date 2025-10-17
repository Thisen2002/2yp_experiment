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
                e.event_categories
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
            categories: event.event_categories || [] // Use the array directly
        }));

        res.json(eventsWithCategories);
    } catch (err) {
        console.error('PostgreSQL fetch error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;