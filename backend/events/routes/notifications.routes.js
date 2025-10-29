const express = require("express");
const pool = require("../db");
const multer = require('multer');

const router = express.Router();

// multer memory storage for images (store in memory, convert to base64 and keep in JSON payload)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Supported categories
const ALLOWED_CATEGORIES = ['lost_found', 'missing_person', 'vehicle', 'weather_alert'];
// Supported severity levels (matches DB constraint)
const ALLOWED_SEVERITIES = ['low', 'mid', 'high'];

// Normalize severity input to allowed values. Accept common synonyms.
function normalizeSeverity(input) {
    if (input === null || input === undefined) return null;
    const s = String(input).trim().toLowerCase();
    if (s === '') return null;
    if (['low', 'l'].includes(s)) return 'low';
    if (['mid', 'medium', 'med', 'm'].includes(s)) return 'mid';
    if (['high', 'h'].includes(s)) return 'high';
    return null; // unknown
}

// Create a notification
router.post('/notifications', async (req, res) => {
    const {
        category,
        title,
        message,
        payload,
        location,
        severity,
        expires_at,
        created_by
    } = req.body;

    // Basic validation
    if (!category || !message) {
        return res.status(400).json({ error: 'category and message are required' });
    }

    // if (!ALLOWED_CATEGORIES.includes(category) || ) {
    //     return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    // }

    // Use cookie userId as fallback for created_by
    const author = created_by || req.cookies?.userId || null;

    // Validate/normalize severity if provided
    let severityNorm = null;
    if (severity !== undefined && severity !== null) {
        severityNorm = normalizeSeverity(severity);
        if (!severityNorm) {
            return res.status(400).json({ error: `Invalid severity. Allowed: ${ALLOWED_SEVERITIES.join(', ')}` });
        }
    }

    try {
        const result = await pool.query(
            `INSERT INTO notifications (category, title, message, payload, location, severity, created_by, expires_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [
                category,
                title || null,
                message,
                payload ? payload : null,
                location || null,
                severityNorm,
                author,
                expires_at || null
            ]
        );

        res.status(201).json({ notification: result.rows[0] });
    } catch (err) {
        console.error('❌ Failed to create notification:', err.message || err);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// POST /notifications/now/upload - create a notification with an image file (multipart/form-data)
// Stores image as base64 inside the notification payload (payload.image = { mime, data })
router.post('/notifications/now/upload', upload.single('image'), async (req, res) => {
    // multipart fields come in req.body; file is in req.file
    const {
        category,
        title,
        message,
        payload,
        location,
        severity,
        expires_at,
        created_by
    } = req.body;

    if (!category || !message) {
        return res.status(400).json({ error: 'category and message are required' });
    }

    // if (!ALLOWED_CATEGORIES.includes(category)) {
    //     return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    // }

    const author = created_by || req.cookies?.userId || null;

    let severityNorm = null;
    if (severity !== undefined && severity !== null && severity !== '') {
        severityNorm = normalizeSeverity(severity);
        if (!severityNorm) {
            return res.status(400).json({ error: `Invalid severity. Allowed: ${ALLOWED_SEVERITIES.join(', ')}` });
        }
    }

    // Build payload object: parse provided payload (if any) and attach image if uploaded
    let payloadObj = null;
    if (payload) {
        try {
            payloadObj = JSON.parse(payload);
        } catch (e) {
            // if not JSON, store as text under a value field
            payloadObj = { value: payload };
        }
    } else {
        payloadObj = {};
    }

    if (req.file && req.file.buffer) {
        try {
            const b64 = req.file.buffer.toString('base64');
            payloadObj.image = { mime: req.file.mimetype, data: b64, filename: req.file.originalname };
        } catch (e) {
            console.error('❌ Failed to process uploaded image:', e.message || e);
            return res.status(500).json({ error: 'Failed to process uploaded image' });
        }
    }

    try {
        await pool.query(
            `INSERT INTO notifications (category, title, message, payload, location, severity, created_by, expires_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [
                category,
                title || null,
                message,
                Object.keys(payloadObj).length ? payloadObj : null,
                location || null,
                severityNorm,
                author,
                expires_at || null
            ]
        );

        // After creation, return the currently active notifications grouped by category
        const grouped = await fetchActiveGrouped();
        res.status(201).json({ message: 'Notification with image created', grouped, count: Object.values(grouped).reduce((s, arr) => s + arr.length, 0) });
    } catch (err) {
        console.error('❌ Failed to create notification with image (now):', err.message || err);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// List notifications with optional filters
router.get('/notifications', async (req, res) => {
    const { category, status, severity, limit = 50, offset = 0 } = req.query;
    const conditions = [];
    const params = [];

    if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
    }

    if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }

    if (severity) {
        const sev = normalizeSeverity(severity);
        if (!sev) return res.status(400).json({ error: `Invalid severity. Allowed: ${ALLOWED_SEVERITIES.join(', ')}` });
        params.push(sev);
        conditions.push(`severity = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(Number(limit));
    params.push(Number(offset));

    const query = `SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    try {
        const result = await pool.query(query, params);
        res.json({ notifications: result.rows });
    } catch (err) {
        console.error('❌ Failed to list notifications:', err.message || err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get notifications by category (dedicated endpoint)
router.get('/notifications/category/:category', async (req, res) => {
    const { category } = req.params;
    if (!category) return res.status(400).json({ error: 'category is required' });
    // if (!ALLOWED_CATEGORIES.includes(category)) {
    //     return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    // }

    try {
        const result = await pool.query(
            `SELECT * FROM notifications WHERE category = $1 ORDER BY created_at DESC`,
            [category]
        );
        res.json({ notifications: result.rows });
    } catch (err) {
        console.error('❌ Failed to fetch notifications by category:', err.message || err);
        res.status(500).json({ error: 'Failed to fetch notifications by category' });
    }
});

// Get specific notification
router.get('/notifications/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    try {
        const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Failed to fetch notification:', err.message || err);
        res.status(500).json({ error: 'Failed to fetch notification' });
    }
});

// ------------------------------------------------------------------
// "Now" endpoints: get active notifications grouped by category
// and create a notification then return the currently active grouped list
// ------------------------------------------------------------------

// Helper: fetch active notifications and group by category
async function fetchActiveGrouped() {
    const q = `SELECT * FROM notifications WHERE status = 'active' AND (expires_at IS NULL OR expires_at > now()) ORDER BY created_at DESC`;
    const r = await pool.query(q);
    const rows = r.rows || [];
    const grouped = {};

    // Ensure all allowed categories exist as keys (optional)
    for (const c of ALLOWED_CATEGORIES) grouped[c] = [];

    for (const row of rows) {
        const cat = row.category || 'uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(row);
    }

    return grouped;
}

// GET /notifications/now
router.get('/notifications/now', async (req, res) => {
    try {
        const grouped = await fetchActiveGrouped();
        res.json({ grouped, count: Object.values(grouped).reduce((s, arr) => s + arr.length, 0) });
    } catch (err) {
        console.error('❌ Failed to fetch active notifications (now):', err.message || err);
        res.status(500).json({ error: 'Failed to fetch active notifications' });
    }
});

// POST /notifications/now - create a notification and return active grouped list
router.post('/notifications/now', async (req, res) => {
    const {
        category,
        title,
        message,
        payload,
        location,
        severity,
        expires_at,
        created_by
    } = req.body;

    // Basic validation
    if (!category || !message) {
        return res.status(400).json({ error: 'category and message are required' });
    }

    // if (!ALLOWED_CATEGORIES.includes(category)) {
    //     return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    // }

    const author = created_by || req.cookies?.userId || null;

    let severityNorm = null;
    if (severity !== undefined && severity !== null) {
        severityNorm = normalizeSeverity(severity);
        if (!severityNorm) {
            return res.status(400).json({ error: `Invalid severity. Allowed: ${ALLOWED_SEVERITIES.join(', ')}` });
        }
    }

    try {
        await pool.query(
            `INSERT INTO notifications (category, title, message, payload, location, severity, created_by, expires_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [
                category,
                title || null,
                message,
                payload ? payload : null,
                location || null,
                severityNorm,
                author,
                expires_at || null
            ]
        );

        // After creation, return the currently active notifications grouped by category
        const grouped = await fetchActiveGrouped();
        res.status(201).json({ message: 'Notification created', grouped, count: Object.values(grouped).reduce((s, arr) => s + arr.length, 0) });
    } catch (err) {
        console.error('❌ Failed to create notification (now):', err.message || err);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// DELETE /notifications/:id
// Soft-delete by default (sets status='cancelled').
// If query param `hard=true` is provided, perform a hard delete from the DB.
router.delete('/notifications/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const hard = String(req.query.hard || '').toLowerCase() === 'true';

    try {
        if (hard) {
            const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
            if (result.rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
            return res.json({ deleted: true, hard: true, notification: result.rows[0] });
        }

        // Soft delete: set status to 'cancelled'
        const result = await pool.query("UPDATE notifications SET status = 'cancelled' WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
        res.json({ deleted: true, hard: false, notification: result.rows[0] });
    } catch (err) {
        console.error('❌ Failed to delete notification:', err.message || err);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// PATCH /notifications/:id
// Partial update of a notification. Accepts any of: category, title, message, payload, location, severity, status, expires_at
router.patch('/notifications/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const allowedFields = ['category','title','message','payload','location','severity','status','expires_at'];
    const updates = [];
    const params = [];

    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            let value = req.body[key];

            // Validate category when provided
            if (key === 'category') {
                if (!ALLOWED_CATEGORIES.includes(value)) {
                    return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
                }
            }

            // Normalize severity when provided
            if (key === 'severity') {
                if (value === null || value === undefined || value === '') {
                    value = null;
                } else {
                    const sev = normalizeSeverity(value);
                    if (!sev) return res.status(400).json({ error: `Invalid severity. Allowed: ${ALLOWED_SEVERITIES.join(', ')}` });
                    value = sev;
                }
            }

            // Special handling for payload and expires_at: empty string -> null
            if ((key === 'payload' || key === 'expires_at') && value === '') {
                value = null;
            }

            // If payload is a string that looks like JSON, try to parse it so it can be stored as JSONB
            if (key === 'payload' && typeof value === 'string') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // keep as string
                }
            }

            params.push(value);
            updates.push(`${key} = $${params.length}`);
        }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No updatable fields provided' });

    const query = `UPDATE notifications SET ${updates.join(', ')} WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);

    try {
        const result = await pool.query(query, params);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Failed to patch notification:', err.message || err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Filter categories APIs: create and list
// Mounted on the same router so paths will be e.g. /memories/filter_categories if this router is mounted at /memories
router.post('/filter_categories', async (req, res) => {
  const { filter_name } = req.body;
  try{
    const result = await pool.query(
      `INSERT INTO filter_catagories (filter_name) VALUES ($1) RETURNING *`,
      [filter_name]
    );
    // return created row
    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    console.error('Failed to create filter category', err.message || err);
    res.status(500).json({ error: 'Failed to create filter category' });
  }
});

router.get('/filter_categories', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM filter_catagories ORDER BY created_at DESC');
    // return as array of names for frontend convenience
    const categories = r.rows.map((row) => row.filter_name);
    res.json({ categories });
  } catch (err) {
    console.error('Failed to list filter categories', err.message || err);
    res.status(500).json({ error: 'Failed to fetch filter categories' });
  }
});

module.exports = router;
