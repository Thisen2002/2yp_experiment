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