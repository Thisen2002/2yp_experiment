DROP DATABASE IF EXISTS engx;

-- Create Database
CREATE DATABASE engx;

\c engx;

CREATE TABLE Events (
    event_ID SERIAL PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(200),
    description TEXT,
    card_image_location TEXT,
    event_categories TEXT[],   -- now supports multiple categories
    CONSTRAINT chk_event_time CHECK (start_time < end_time)
);

CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interested_category (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
    UNIQUE(user_id, category_id)  -- Prevent duplicate user-category pairs
);

CREATE TABLE ratings (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) NOT NULL,
    visitor_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, visitor_id) -- Prevents duplicate ratings per visitor
);

ALTER TABLE Events ADD COLUMN interested_count INTEGER DEFAULT 0;

-- Create interested_events table
CREATE TABLE interested_events (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    event_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    UNIQUE(user_id, event_id)  -- Prevent duplicate interests
);


--indert the code for heatmap

CREATE TABLE buildings (
    building_id VARCHAR(10) PRIMARY KEY,   -- Auto-increment primary key
    building_name VARCHAR(100) NOT NULL,
    building_capacity INT NOT NULL CHECK (building_capacity > 0)
);

INSERT INTO buildings (building_id, building_name, building_capacity) VALUES
('B1',  'Engineering Carpentry Shop', 85),
('B2',  'Engineering Workshop', 85),
('B3',  '', 1),
('B4',  'Generator Room', 1),
('B5',  '', 1),
('B6',  'Structure Lab', 60),
('B7',  'Administrative Building', 80),
('B8',  'Canteen', 20),
('B9',  'Lecture Room 10/11', 130),
('B10', 'Engineering Library', 80),
('B11', 'Department of Chemical and process Engineering', 80),
('B12', 'Lecture Room 2/3', 130),
('B13', 'Drawing Office 2', 200),
('B14', 'Faculty Canteen', 80),
('B15', 'Department of Manufacturing and Industrial Engineering', 80),
('B16', 'Professor E.O.E. Perera Theater', 80),
('B17', 'Electronic Lab', 130),
('B18', 'Washrooms', 30),
('B19', 'Electrical and Electronic Workshop', 60),
('B20', 'Department of Computer Engineering', 130),
('B21', '', 30),
('B22', 'Environmental Lab', 70),
('B23', 'Applied Mechanics Lab', 100),
('B24', 'New Mechanics Lab', 100),
('B25', '', 30),
('B26', '', 30),
('B27', '', 30),
('B28', 'Materials Lab', 140),
('B29', 'Thermodynamics Lab', 140),
('B30', 'Fluids Lab', 140),
('B31', 'Surveying and Soil Lab', 140),
('B32', 'Department of Engineering Mathematics', 100),
('B33', 'Drawing Office 1', 200),
('B34', 'Department of Electrical and Electronic Engineering ', 150);



-- Create current_status table
CREATE TABLE current_status (
       -- Unique row identifier
    building_id VARCHAR(10) NOT NULL PRIMARY KEY,
    current_crowd INT NOT NULL CHECK (current_crowd >= 0),
    color VARCHAR(20),
    status_timestamp VARCHAR(50) DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_building
        FOREIGN KEY (building_id) 
        REFERENCES buildings(building_id)
        ON DELETE CASCADE
);

-- organize dashboard tables

CREATE TABLE Organizer (
    organizer_ID SERIAL PRIMARY KEY,
    organizer_name VARCHAR(255) NOT NULL,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contact_no VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE exhibits (
    exhibit_name VARCHAR(255) PRIMARY KEY,
    building_id VARCHAR(10) NOT NULL,
    exhibit_tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to buildings table
    CONSTRAINT fk_exhibits_building 
        FOREIGN KEY (building_id) 
        REFERENCES buildings(building_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-------------------------------------------------------------------------------------------------------------------------
-- Entry/Exit logging for visitor tracking
CREATE TABLE entry_exit_log (
    log_id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) NOT NULL,
    building_id VARCHAR(10) NOT NULL,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    qr_code VARCHAR(255),
    session_duration INTERVAL GENERATED ALWAYS AS (exit_time - entry_time) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE
);

-- Visitor registration/tracking
CREATE TABLE visitors (
    visitor_id VARCHAR(255) PRIMARY KEY,
    visitor_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visitor_type VARCHAR(50) DEFAULT 'general' -- 'student', 'faculty', 'general', etc.
);

-- Daily visitor counts per building
CREATE TABLE daily_visitor_counts (
    count_id SERIAL PRIMARY KEY,
    building_id VARCHAR(10) NOT NULL,
    visit_date DATE NOT NULL,
    total_visitors INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE,
    UNIQUE(building_id, visit_date)
);