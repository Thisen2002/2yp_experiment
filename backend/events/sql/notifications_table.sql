-- notifications_table.sql
-- Create a notifications table for local PostgreSQL database.
-- Categories supported: 'lost_found', 'missing_person', 'vehicle', 'weather_alert'

\c engx;

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title TEXT,
    message TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    location TEXT,
    severity VARCHAR(20), -- e.g. low, medium, high
    status VARCHAR(20) DEFAULT 'active', -- active, resolved, cancelled
    created_by VARCHAR(255), -- optional user identifier (could be cookie userId)
    read_by JSONB DEFAULT '[]'::jsonb, -- array of userIds who have read the notification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Helpful indexes for queries by category and recent notifications
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Optional constraint to limit categories (keeps schema simple without a PG enum)
ALTER TABLE notifications
    ADD CONSTRAINT notifications_category_check
    CHECK (category IN ('lost_found','missing_person','vehicle','weather_alert'));

-- Sample seed (uncomment to insert a sample row)
-- INSERT INTO notifications (category, title, message, payload, location, severity, created_by)
-- VALUES ('lost_found', 'Lost wallet', 'Black leather wallet lost near cafeteria', '{"color":"black","type":"wallet"}', 'Cafeteria', 'medium', 'system');
