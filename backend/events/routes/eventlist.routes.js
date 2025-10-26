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
                e.card_image_location,
                e.interested_count
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
            card_image_location: event.card_image_location,
            interested_count: event.interested_count || 0
        }));

        res.json(eventsWithCategories);
    } catch (err) {
        console.error('PostgreSQL fetch error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/events -> add a new event
router.post('/', async (req, res) => {
    try {
        const {
            event_name,
            start_time,
            end_time,
            location,
            description,
            card_image_location,
            event_categories
        } = req.body;

        // Validation
        if (!event_name || !start_time || !end_time) {
            return res.status(400).json({ 
                error: 'Missing required fields: event_name, start_time, end_time' 
            });
        }

        // Validate that start_time is before end_time
        if (new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ 
                error: 'Start time must be before end time' 
            });
        }

        // Validate event_categories is an array
        if (event_categories && !Array.isArray(event_categories)) {
            return res.status(400).json({ 
                error: 'event_categories must be an array' 
            });
        }

        // Insert the new event
        const result = await pool.query(`
            INSERT INTO Events (
                event_name, 
                start_time, 
                end_time, 
                location, 
                description, 
                card_image_location, 
                event_categories,
                interested_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING 
                event_id,
                event_name AS event_title,
                start_time,
                end_time,
                location,
                description,
                card_image_location,
                event_categories,
                interested_count
        `, [
            event_name,
            start_time,
            end_time,
            location || null,
            description || null,
            card_image_location || null,
            event_categories || [],
            0 // Initial interested_count
        ]);

        // Format the response
        const newEvent = {
            event_id: result.rows[0].event_id,
            event_title: result.rows[0].event_title,
            start_time: result.rows[0].start_time,
            end_time: result.rows[0].end_time,
            location: result.rows[0].location,
            description: result.rows[0].description,
            categories: result.rows[0].event_categories || [],
            card_image_location: result.rows[0].card_image_location,
            interested_count: result.rows[0].interested_count
        };

        res.status(201).json({
            message: 'Event created successfully',
            event: newEvent
        });

    } catch (err) {
        console.error('PostgreSQL insert error:', err.message);
        
        // Handle specific PostgreSQL errors
        if (err.code === '23514') { // Check constraint violation
            return res.status(400).json({ 
                error: 'Invalid data: Please check that start time is before end time' 
            });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/events/:id -> update an existing event
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            event_name,
            start_time,
            end_time,
            location,
            description,
            card_image_location,
            event_categories
        } = req.body;

        // Check if event exists
        const existingEvent = await pool.query('SELECT event_id FROM Events WHERE event_id = $1', [id]);
        if (existingEvent.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Validation
        if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ 
                error: 'Start time must be before end time' 
            });
        }

        if (event_categories && !Array.isArray(event_categories)) {
            return res.status(400).json({ 
                error: 'event_categories must be an array' 
            });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (event_name !== undefined) {
            updates.push(`event_name = $${paramCount}`);
            values.push(event_name);
            paramCount++;
        }
        if (start_time !== undefined) {
            updates.push(`start_time = $${paramCount}`);
            values.push(start_time);
            paramCount++;
        }
        if (end_time !== undefined) {
            updates.push(`end_time = $${paramCount}`);
            values.push(end_time);
            paramCount++;
        }
        if (location !== undefined) {
            updates.push(`location = $${paramCount}`);
            values.push(location);
            paramCount++;
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }
        if (card_image_location !== undefined) {
            updates.push(`card_image_location = $${paramCount}`);
            values.push(card_image_location);
            paramCount++;
        }
        if (event_categories !== undefined) {
            updates.push(`event_categories = $${paramCount}`);
            values.push(event_categories);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id); // Add ID for WHERE clause

        const result = await pool.query(`
            UPDATE Events 
            SET ${updates.join(', ')}
            WHERE event_id = $${paramCount}
            RETURNING 
                event_id,
                event_name AS event_title,
                start_time,
                end_time,
                location,
                description,
                card_image_location,
                event_categories,
                interested_count
        `, values);

        // Format the response
        const updatedEvent = {
            event_id: result.rows[0].event_id,
            event_title: result.rows[0].event_title,
            start_time: result.rows[0].start_time,
            end_time: result.rows[0].end_time,
            location: result.rows[0].location,
            description: result.rows[0].description,
            categories: result.rows[0].event_categories || [],
            card_image_location: result.rows[0].card_image_location,
            interested_count: result.rows[0].interested_count
        };

        res.json({
            message: 'Event updated successfully',
            event: updatedEvent
        });

    } catch (err) {
        console.error('PostgreSQL update error:', err.message);
        
        if (err.code === '23514') {
            return res.status(400).json({ 
                error: 'Invalid data: Please check that start time is before end time' 
            });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/events/:id -> delete an event
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if event exists
        const existingEvent = await pool.query('SELECT event_id FROM Events WHERE event_id = $1', [id]);
        if (existingEvent.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Delete the event
        await pool.query('DELETE FROM Events WHERE event_id = $1', [id]);

        res.json({ message: 'Event deleted successfully' });

    } catch (err) {
        console.error('PostgreSQL delete error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;