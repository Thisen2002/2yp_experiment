\c engx;

INSERT INTO Events (event_name, start_time, end_time, location, description, card_image_location, event_categories) VALUES
('Tech Conference 2025', '2025-11-15 09:00:00', '2025-11-15 17:00:00', 'Convention Center Hall A', 'Annual technology conference featuring latest innovations in AI, blockchain, and IoT', '/images/tech_conference.png', ARRAY['Technology', 'Conference']),

('Music Festival Summer', '2025-07-20 18:00:00', '2025-07-22 23:00:00', 'Central Park Amphitheater', 'Three-day music festival featuring local and international artists across multiple genres', '/images/music_festival.png', ARRAY['Music', 'Festival', 'Entertainment']),

('Business Networking Meetup', '2025-10-25 18:30:00', '2025-10-25 21:00:00', 'Downtown Business Center', 'Monthly networking event for entrepreneurs and business professionals', '/images/networking.png', ARRAY['Business', 'Networking']),

('Art Exhibition Opening', '2025-12-05 19:00:00', '2025-12-05 22:00:00', 'Modern Art Gallery', 'Grand opening of contemporary art exhibition featuring emerging local artists', '/images/art_exhibition.png', ARRAY['Art', 'Culture', 'Exhibition']),

('Coding Bootcamp Workshop', '2025-11-30 10:00:00', '2025-11-30 16:00:00', 'Tech Hub Building 2', 'Intensive workshop covering React, Node.js, and modern web development practices', '/images/coding_workshop.png', ARRAY['Technology', 'Education', 'Workshop']),

('Food & Wine Festival', '2025-09-14 12:00:00', '2025-09-15 20:00:00', 'Riverside Park', 'Culinary celebration featuring local chefs, wine tastings, and cooking demonstrations', '/images/food_wine.png', ARRAY['Food', 'Festival', 'Culture']),

('Startup Pitch Competition', '2025-10-18 14:00:00', '2025-10-18 18:00:00', 'Innovation Center Auditorium', 'Competition for early-stage startups to pitch their ideas to investors and mentors', '/images/startup_pitch.png', ARRAY['Business', 'Startup', 'Competition']),

('Charity Run Marathon', '2025-08-10 06:00:00', '2025-08-10 12:00:00', 'City Center Starting Point', '10K charity run to raise funds for local community programs', '/images/charity_run.png', ARRAY['Sports', 'Charity', 'Health']),

('Digital Marketing Summit', '2025-11-08 09:30:00', '2025-11-08 17:30:00', 'Business District Conference Room', 'Summit focusing on latest trends in digital marketing, SEO, and social media strategies', '/images/marketing_summit.png', ARRAY['Marketing', 'Business', 'Digital']),

('Photography Workshop', '2025-10-30 13:00:00', '2025-10-30 17:00:00', 'Community Arts Center', 'Hands-on photography workshop covering portrait and landscape techniques', '/images/photo_workshop.png', ARRAY['Photography', 'Workshop', 'Art']);

INSERT INTO Categories (category_name, description) VALUES
('Technology', 'Events related to technology, software, AI, and digital innovations'),
('Conference', 'Professional conferences and seminars'),
('Music', 'Musical performances, concerts, and music-related events'),
('Festival', 'Cultural festivals and celebrations'),
('Entertainment', 'Entertainment and recreational events'),
('Business', 'Business networking, professional development, and corporate events'),
('Networking', 'Professional networking and social connection events'),
('Art', 'Art exhibitions, galleries, and artistic performances'),
('Culture', 'Cultural events and educational experiences'),
('Exhibition', 'Exhibitions, displays, and showcases'),
('Education', 'Educational workshops, classes, and learning events'),
('Workshop', 'Hands-on workshops and skill-building sessions'),
('Food', 'Food festivals, culinary events, and dining experiences'),
('Startup', 'Startup-related events, pitch competitions, and entrepreneurship'),
('Competition', 'Competitive events and contests'),
('Sports', 'Sports events, fitness activities, and athletic competitions'),
('Charity', 'Charitable events and fundraising activities'),
('Health', 'Health and wellness events'),
('Marketing', 'Marketing, advertising, and promotional events'),
('Digital', 'Digital marketing and online business events'),
('Photography', 'Photography workshops, exhibitions, and related events');



INSERT INTO exhibits (exhibit_name, building_id, exhibit_tags) VALUES
('asss', 'B1', '{"asss": ["Mechanical"]}'),
('kiosk', 'B2', '{"kiosk": ["Automation", "Robotics"]}'),
('kiosk,swam', 'B3', '{"swam": ["Civil", "Mechanical"], "kiosk": ["ICT"]}'),
('robotics_display', 'B17', '{"robotics_display": ["Electronics", "AI"]}'),
('chemical_process', 'B11', '{"chemical_process": ["Chemical", "Manufacturing"]}');

-- ...existing code...

INSERT INTO exhibits (exhibit_name, building_id, exhibit_tags) VALUES
('woodworking_station', 'B1', '{"woodworking_station": ["Mechanical", "Manufacturing"]}'),
('carpentry_tools', 'B1', '{"carpentry_tools": ["Manufacturing", "Traditional"]}'),
('wood_joint_display', 'B1', '{"wood_joint_display": ["Engineering", "Construction"]}'),

('cnc_machine', 'B2', '{"cnc_machine": ["Automation", "Manufacturing", "Mechanical"]}'),
('welding_demo', 'B2', '{"welding_demo": ["Manufacturing", "Mechanical"]}'),
('metal_fabrication', 'B2', '{"metal_fabrication": ["Materials", "Manufacturing"]}'),

('structural_model', 'B6', '{"structural_model": ["Civil", "Engineering"]}'),
('load_testing', 'B6', '{"load_testing": ["Civil", "Mechanical"]}'),

('robotics_arm', 'B17', '{"robotics_arm": ["Robotics", "Electronics", "AI"]}'),
('circuit_boards', 'B17', '{"circuit_boards": ["Electronics", "Computer Science"]}'),
('sensor_network', 'B17', '{"sensor_network": ["Electronics", "ICT", "Automation"]}'),

('microprocessor_demo', 'B20', '{"microprocessor_demo": ["Computer Science", "Electronics"]}'),
('ai_chatbot', 'B20', '{"ai_chatbot": ["AI", "Computer Science"]}'),
('programming_showcase', 'B20', '{"programming_showcase": ["Computer Science", "Software"]}'),

('chemical_reactor', 'B11', '{"chemical_reactor": ["Chemical", "Manufacturing"]}'),
('process_control', 'B11', '{"process_control": ["Chemical", "Automation"]}'),

('3d_printer', 'B15', '{"3d_printer": ["Manufacturing", "Automation"]}'),
('industrial_robotics', 'B15', '{"industrial_robotics": ["Manufacturing", "Robotics", "Automation"]}'),

('power_systems', 'B34', '{"power_systems": ["Electrical", "Electronics"]}'),
('renewable_energy', 'B34', '{"renewable_energy": ["Electrical", "Environmental"]}'),
('smart_grid', 'B34', '{"smart_grid": ["Electrical", "ICT", "Automation"]}');





------------------------------------------------------------------------------------------------------------
-- Insert sample visitors
INSERT INTO visitors (visitor_id, visitor_name, email, visitor_type) VALUES
('V001', 'John Doe', 'john@example.com', 'student'),
('V002', 'Jane Smith', 'jane@example.com', 'faculty'),
('V003', 'Bob Wilson', 'bob@example.com', 'general'),
('V004', 'Alice Brown', 'alice@example.com', 'student'),
('V005', 'Charlie Davis', 'charlie@example.com', 'general');

-- Insert sample entry/exit logs
INSERT INTO entry_exit_log (visitor_id, building_id, entry_time, exit_time, qr_code) VALUES
('V001', 'B1', '2025-10-19 09:00:00', '2025-10-19 10:30:00', 'QR001'),
('V002', 'B1', '2025-10-19 09:15:00', '2025-10-19 11:00:00', 'QR002'),
('V003', 'B17', '2025-10-19 10:00:00', '2025-10-19 12:00:00', 'QR003'),
('V001', 'B17', '2025-10-19 11:30:00', '2025-10-19 13:00:00', 'QR004'),
('V004', 'B20', '2025-10-19 14:00:00', '2025-10-19 16:30:00', 'QR005'),
('V005', 'B20', '2025-10-19 14:30:00', NULL, 'QR006'), -- Still inside
('V002', 'B34', '2025-10-19 15:00:00', '2025-10-19 17:00:00', 'QR007');

-- Insert sample daily counts
INSERT INTO daily_visitor_counts (building_id, visit_date, total_visitors, unique_visitors) VALUES
('B1', '2025-10-19', 5, 3),
('B17', '2025-10-19', 8, 5),
('B20', '2025-10-19', 12, 8),
('B34', '2025-10-19', 6, 4),
('B11', '2025-10-19', 3, 3),
('B2', '2025-10-19', 7, 6);

-- Update current_status with realistic data
INSERT INTO current_status (building_id, current_crowd, color) VALUES
('B1', 5, 'green'),
('B2', 12, 'yellow'),
('B17', 18, 'orange'),
('B20', 25, 'red'),
('B34', 8, 'green')
ON CONFLICT (building_id) DO UPDATE SET
current_crowd = EXCLUDED.current_crowd,
color = EXCLUDED.color,
status_timestamp = CURRENT_TIMESTAMP;