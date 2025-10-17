-- Connect to your database first
\c organizer_dashboard;

-- 1. Create categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create user interests table
CREATE TABLE interested_category (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interested_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_category UNIQUE (user_id, category_id)
);

-- 3. Create event-categories mapping table
CREATE TABLE event_categories (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    CONSTRAINT fk_event_categories_event FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_event_categories_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    CONSTRAINT unique_event_category UNIQUE (event_id, category_id)
);

-- 4. Insert sample data
INSERT INTO categories (category_name, description) VALUES
('Technology', 'Tech conferences, workshops, and seminars'),
('Music', 'Concerts, festivals, and music events'),
('Sports', 'Athletic events, competitions, and sports activities'),
('Art', 'Art exhibitions, galleries, and creative workshops'),
('Food', 'Food festivals, cooking classes, and culinary events'),
('Business', 'Networking events, seminars, and business conferences'),
('Education', 'Academic conferences, workshops, and learning events'),
('Health', 'Wellness workshops, fitness events, and health seminars'),
('Entertainment', 'Shows, performances, and entertainment events'),
('Travel', 'Travel expos, cultural events, and tourism activities');

-- 5. Verify the tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'interested_category', 'event_categories');

-- 6. Check sample categories
SELECT * FROM categories;