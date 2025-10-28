-- notifications_seeds.sql
-- Test seed data for notifications table. Run this against the same DB used by the app.
-- Adjust timestamps or created_by as needed.

-- Lost & Found
INSERT INTO notifications (category, title, message, payload, location, severity, created_by, created_at)
VALUES (
  'lost_found',
  'Found: Black Wallet',
  'A black leather wallet containing ID and some cards was found near the main library steps.',
  '{"item":"wallet","color":"black","found_near":"library steps"}'::jsonb,
  'Main Library Steps',
  'low',
  'test-seed',
  now()
);

-- Missing Person
INSERT INTO notifications (category, title, message, payload, location, severity, created_by, created_at)
VALUES (
  'missing_person',
  'Missing: John Doe',
  'John Doe, approx. 17 years old, last seen near the north quad wearing a blue hoodie. Please report any sightings to security.',
  '{"name":"John Doe","age":17,"clothing":"blue hoodie"}'::jsonb,
  'North Quad',
  'high',
  'test-seed',
  now()
);

-- Vehicle (removal) announcement
INSERT INTO notifications (category, title, message, payload, location, severity, created_by, created_at)
VALUES (
  'vehicle',
  'Vehicle removal request',
  'Black sedan (plate: ABC-123) parked in the emergency lane by Gate 3. Please remove the vehicle to clear the lane.',
  '{"plate":"ABC-123","color":"black","type":"sedan"}'::jsonb,
  'Gate 3 Parking / Emergency Lane',
  'mid',
  'test-seed',
  now()
);

-- Weather alert
INSERT INTO notifications (category, title, message, payload, location, severity, created_by, created_at, expires_at)
VALUES (
  'weather_alert',
  'Severe Thunderstorm Warning',
  'Severe thunderstorm expected in the campus area for the next 2 hours. Seek shelter indoors and avoid outdoor activities.',
  '{"type":"thunderstorm","duration_minutes":120}'::jsonb,
  'Campus-wide',
  'high',
  'test-seed',
  now(),
  now() + interval '2 hours'
);

-- End of seeds
