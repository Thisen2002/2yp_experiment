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


--2025-10-26 data

INSERT INTO Events (event_name, start_time, end_time, location, description, card_image_location, event_categories) VALUES
('AI & Machine Learning Summit', '2025-11-20 08:00:00', '2025-11-20 18:00:00', 'B20', 'Deep dive into latest AI technologies and machine learning algorithms', '/images/ai_summit.png', ARRAY['Technology', 'Education', 'AI']),
('Robotics Engineering Fair', '2025-12-01 09:00:00', '2025-12-01 17:00:00', 'B17', 'Showcase of latest robotics projects and innovations', '/images/robotics_fair.png', ARRAY['Technology', 'Robotics', 'Engineering']),
('Chemical Process Innovation', '2025-11-25 10:00:00', '2025-11-25 16:00:00', 'B11', 'Latest advances in chemical engineering processes', '/images/chemical_innovation.png', ARRAY['Chemical', 'Engineering', 'Innovation']),
('Manufacturing Technology Expo', '2025-12-10 09:30:00', '2025-12-10 18:30:00', 'B15', 'Industrial manufacturing and automation technologies', '/images/manufacturing_expo.png', ARRAY['Manufacturing', 'Technology', 'Industrial']),
('Electrical Systems Conference', '2025-11-28 08:30:00', '2025-11-28 17:30:00', 'B34', 'Power systems and electrical engineering innovations', '/images/electrical_conf.png', ARRAY['Electrical', 'Engineering', 'Power']),
('Carpentry Workshop', '2025-12-05 10:00:00', '2025-12-05 15:00:00', 'B1', 'Traditional and modern carpentry techniques', '/images/carpentry_workshop.png', ARRAY['Workshop', 'Traditional', 'Crafts']),
('Metalworking Masterclass', '2025-11-22 09:00:00', '2025-11-22 16:00:00', 'B2', 'Advanced metalworking and fabrication techniques', '/images/metalworking.png', ARRAY['Workshop', 'Manufacturing', 'Skills']),
('Structural Engineering Seminar', '2025-12-03 13:00:00', '2025-12-03 17:00:00', 'B6', 'Building design and structural analysis', '/images/structural_seminar.png', ARRAY['Civil', 'Engineering', 'Construction']),
('Computer Programming Bootcamp', '2025-11-18 08:00:00', '2025-11-20 18:00:00', 'B20', '3-day intensive programming workshop', '/images/programming_bootcamp.png', ARRAY['Technology', 'Programming', 'Education']),
('Electronics Design Workshop', '2025-12-08 10:00:00', '2025-12-08 16:00:00', 'B17', 'PCB design and electronics prototyping', '/images/electronics_workshop.png', ARRAY['Electronics', 'Design', 'Workshop']),
('Environmental Engineering Forum', '2025-11-30 09:00:00', '2025-11-30 15:00:00', 'B22', 'Sustainable engineering and environmental protection', '/images/environmental_forum.png', ARRAY['Environmental', 'Engineering', 'Sustainability']),
('Applied Mechanics Lab Tour', '2025-12-02 14:00:00', '2025-12-02 16:00:00', 'B23', 'Hands-on mechanics experiments and demonstrations', '/images/mechanics_tour.png', ARRAY['Mechanics', 'Engineering', 'Education']),
('Materials Science Exhibition', '2025-11-27 10:30:00', '2025-11-27 16:30:00', 'B28', 'Latest materials research and applications', '/images/materials_exhibition.png', ARRAY['Materials', 'Science', 'Research']),
('Thermodynamics Workshop', '2025-12-04 11:00:00', '2025-12-04 15:00:00', 'B29', 'Energy systems and thermodynamic principles', '/images/thermo_workshop.png', ARRAY['Thermodynamics', 'Energy', 'Workshop']),
('Fluid Mechanics Demo', '2025-11-26 13:30:00', '2025-11-26 17:30:00', 'B30', 'Fluid flow analysis and applications', '/images/fluid_demo.png', ARRAY['Fluid Mechanics', 'Engineering', 'Demo']),
('Surveying Technology Fair', '2025-12-06 09:00:00', '2025-12-06 17:00:00', 'B31', 'Modern surveying equipment and techniques', '/images/surveying_fair.png', ARRAY['Surveying', 'Technology', 'Civil']),
('Engineering Mathematics Symposium', '2025-11-21 10:00:00', '2025-11-21 16:00:00', 'B32', 'Mathematical modeling in engineering', '/images/math_symposium.png', ARRAY['Mathematics', 'Engineering', 'Education']),
('CAD Design Competition', '2025-12-07 08:00:00', '2025-12-07 18:00:00', 'B33', 'Computer-aided design competition for students', '/images/cad_competition.png', ARRAY['Design', 'Competition', 'CAD']),
('Student Innovation Showcase', '2025-11-29 09:00:00', '2025-11-29 17:00:00', 'B16', 'Student projects and innovative solutions', '/images/innovation_showcase.png', ARRAY['Innovation', 'Student', 'Projects']),
('Faculty Research Presentations', '2025-12-09 14:00:00', '2025-12-09 18:00:00', 'B9', 'Faculty research findings and publications', '/images/research_presentations.png', ARRAY['Research', 'Faculty', 'Academic']),
('Industry Partnership Forum', '2025-11-23 13:00:00', '2025-11-23 17:00:00', 'B7', 'Collaboration between academia and industry', '/images/industry_forum.png', ARRAY['Industry', 'Partnership', 'Business']),
('Green Technology Summit', '2025-12-11 08:30:00', '2025-12-11 17:30:00', 'B22', 'Sustainable and green engineering solutions', '/images/green_tech.png', ARRAY['Green Technology', 'Sustainability', 'Environment']),
('IoT and Smart Systems', '2025-11-24 10:00:00', '2025-11-24 16:00:00', 'B20', 'Internet of Things and smart system integration', '/images/iot_systems.png', ARRAY['IoT', 'Smart Systems', 'Technology']),
('3D Printing Workshop', '2025-12-12 11:00:00', '2025-12-12 15:00:00', 'B15', 'Additive manufacturing and 3D printing techniques', '/images/3d_printing.png', ARRAY['3D Printing', 'Manufacturing', 'Workshop']),
('Renewable Energy Conference', '2025-11-19 09:00:00', '2025-11-19 17:00:00', 'B34', 'Solar, wind, and alternative energy systems', '/images/renewable_energy.png', ARRAY['Renewable Energy', 'Electrical', 'Environment']),
('Cybersecurity in Engineering', '2025-12-13 13:00:00', '2025-12-13 17:00:00', 'B20', 'Security challenges in engineering systems', '/images/cybersecurity.png', ARRAY['Cybersecurity', 'Engineering', 'Technology']),
('Automation and Control Systems', '2025-11-17 08:00:00', '2025-11-17 16:00:00', 'B15', 'Industrial automation and process control', '/images/automation.png', ARRAY['Automation', 'Control Systems', 'Industrial']),
('Biomedical Engineering Expo', '2025-12-14 10:00:00', '2025-12-14 18:00:00', 'B28', 'Medical devices and bioengineering innovations', '/images/biomedical.png', ARRAY['Biomedical', 'Engineering', 'Healthcare']),
('Quality Assurance Workshop', '2025-11-16 14:00:00', '2025-11-16 18:00:00', 'B15', 'Quality control and assurance in manufacturing', '/images/quality_assurance.png', ARRAY['Quality Assurance', 'Manufacturing', 'Workshop']),
('Project Management Seminar', '2025-12-15 09:30:00', '2025-12-15 15:30:00', 'B7', 'Engineering project management methodologies', '/images/project_management.png', ARRAY['Project Management', 'Engineering', 'Business']),
('Data Science in Engineering', '2025-11-15 10:30:00', '2025-11-15 16:30:00', 'B20', 'Big data applications in engineering', '/images/data_science.png', ARRAY['Data Science', 'Engineering', 'Analytics']),
('Virtual Reality Applications', '2025-12-16 11:00:00', '2025-12-16 17:00:00', 'B20', 'VR and AR in engineering design and training', '/images/vr_applications.png', ARRAY['Virtual Reality', 'Technology', 'Innovation']),
('Mechanical Systems Design', '2025-11-14 08:00:00', '2025-11-14 16:00:00', 'B23', 'Mechanical component design and analysis', '/images/mechanical_design.png', ARRAY['Mechanical', 'Design', 'Engineering']),
('Process Optimization Workshop', '2025-12-17 13:30:00', '2025-12-17 17:30:00', 'B11', 'Optimizing industrial and chemical processes', '/images/process_optimization.png', ARRAY['Process Optimization', 'Chemical', 'Industrial']),
('Embedded Systems Development', '2025-11-13 09:00:00', '2025-11-13 17:00:00', 'B17', 'Microcontroller programming and embedded systems', '/images/embedded_systems.png', ARRAY['Embedded Systems', 'Electronics', 'Programming']),
('Entrepreneurship in Engineering', '2025-12-18 14:00:00', '2025-12-18 18:00:00', 'B7', 'Starting engineering-based businesses', '/images/entrepreneurship.png', ARRAY['Entrepreneurship', 'Business', 'Innovation']),
('Safety Engineering Forum', '2025-11-12 10:00:00', '2025-11-12 14:00:00', 'B22', 'Workplace safety and risk management', '/images/safety_engineering.png', ARRAY['Safety', 'Engineering', 'Risk Management']),
('Nanotechnology Symposium', '2025-12-19 09:00:00', '2025-12-19 15:00:00', 'B28', 'Nanoscale engineering and applications', '/images/nanotechnology.png', ARRAY['Nanotechnology', 'Materials', 'Research']),
('Communication Skills for Engineers', '2025-11-11 15:00:00', '2025-11-11 17:00:00', 'B32', 'Technical communication and presentation skills', '/images/communication_skills.png', ARRAY['Communication', 'Skills', 'Professional Development']),
('International Engineering Collaboration', '2025-12-20 08:00:00', '2025-12-20 16:00:00', 'B7', 'Global engineering partnerships and projects', '/images/international_collab.png', ARRAY['International', 'Collaboration', 'Engineering']),
('Alumni Engineering Network', '2025-11-10 18:00:00', '2025-11-10 21:00:00', 'B14', 'Alumni networking and industry connections', '/images/alumni_network.png', ARRAY['Alumni', 'Networking', 'Professional']),
('Future of Engineering Education', '2025-12-21 10:00:00', '2025-12-21 16:00:00', 'B9', 'Evolving engineering curriculum and pedagogy', '/images/future_education.png', ARRAY['Education', 'Future', 'Engineering']),
('Women in Engineering Forum', '2025-11-09 13:00:00', '2025-11-09 17:00:00', 'B16', 'Supporting and celebrating women engineers', '/images/women_engineering.png', ARRAY['Women in Engineering', 'Diversity', 'Professional']),
('Engineering Ethics Debate', '2025-12-22 14:30:00', '2025-12-22 16:30:00', 'B32', 'Ethical considerations in engineering practice', '/images/ethics_debate.png', ARRAY['Ethics', 'Engineering', 'Philosophy']),
('Smart City Technologies', '2025-11-08 09:30:00', '2025-11-08 17:30:00', 'B20', 'Technology solutions for urban development', '/images/smart_city.png', ARRAY['Smart City', 'Urban Planning', 'Technology']),
('Climate Change Engineering Solutions', '2025-12-23 08:00:00', '2025-12-23 18:00:00', 'B22', 'Engineering responses to climate challenges', '/images/climate_solutions.png', ARRAY['Climate Change', 'Environmental', 'Engineering']),
('Digital Twins in Manufacturing', '2025-11-07 11:00:00', '2025-11-07 15:00:00', 'B15', 'Virtual modeling of physical systems', '/images/digital_twins.png', ARRAY['Digital Twins', 'Manufacturing', 'Simulation']),
('Blockchain in Supply Chain', '2025-12-24 13:00:00', '2025-12-24 17:00:00', 'B20', 'Blockchain applications in engineering logistics', '/images/blockchain_supply.png', ARRAY['Blockchain', 'Supply Chain', 'Technology']),
('Augmented Reality for Maintenance', '2025-11-06 10:30:00', '2025-11-06 16:30:00', 'B17', 'AR applications in equipment maintenance', '/images/ar_maintenance.png', ARRAY['Augmented Reality', 'Maintenance', 'Technology']),
('Edge Computing Workshop', '2025-12-25 09:00:00', '2025-12-25 17:00:00', 'B20', 'Distributed computing at the network edge', '/images/edge_computing.png', ARRAY['Edge Computing', 'Technology', 'Workshop']);

-- Insert more Visitors (100 visitors)

INSERT INTO exhibits (exhibit_name, building_id, exhibit_tags) VALUES
('advanced_cnc_machining', 'B2', '{"advanced_cnc_machining": ["Manufacturing", "Automation", "Precision"]}'),
('laser_cutting_display', 'B2', '{"laser_cutting_display": ["Manufacturing", "Technology", "Materials"]}'),
('pneumatic_systems', 'B2', '{"pneumatic_systems": ["Automation", "Mechanical", "Control"]}'),
('hydraulic_press_demo', 'B2', '{"hydraulic_press_demo": ["Mechanical", "Manufacturing", "Power"]}'),
('metal_casting_process', 'B2', '{"metal_casting_process": ["Manufacturing", "Materials", "Traditional"]}'),

('microcontroller_projects', 'B17', '{"microcontroller_projects": ["Electronics", "Programming", "Embedded"]}'),
('iot_sensor_network', 'B17', '{"iot_sensor_network": ["IoT", "Sensors", "Communication"]}'),
('pcb_design_station', 'B17', '{"pcb_design_station": ["Electronics", "Design", "Manufacturing"]}'),
('signal_processing_lab', 'B17', '{"signal_processing_lab": ["Electronics", "Signal Processing", "DSP"]}'),
('wireless_communication', 'B17', '{"wireless_communication": ["Electronics", "Communication", "RF"]}'),

('machine_learning_demo', 'B20', '{"machine_learning_demo": ["AI", "Machine Learning", "Data Science"]}'),
('computer_vision_system', 'B20', '{"computer_vision_system": ["AI", "Computer Vision", "Image Processing"]}'),
('database_management', 'B20', '{"database_management": ["Software", "Database", "Data Management"]}'),
('web_development_showcase', 'B20', '{"web_development_showcase": ["Software", "Web Development", "Programming"]}'),
('cybersecurity_lab', 'B20', '{"cybersecurity_lab": ["Security", "Networking", "Cybersecurity"]}'),

('power_electronics', 'B34', '{"power_electronics": ["Electrical", "Power", "Electronics"]}'),
('motor_control_systems', 'B34', '{"motor_control_systems": ["Electrical", "Control", "Motors"]}'),
('solar_panel_array', 'B34', '{"solar_panel_array": ["Renewable Energy", "Solar", "Electrical"]}'),
('transformer_display', 'B34', '{"transformer_display": ["Electrical", "Power", "Transformers"]}'),
('electrical_safety_demo', 'B34', '{"electrical_safety_demo": ["Safety", "Electrical", "Education"]}'),

('distillation_column', 'B11', '{"distillation_column": ["Chemical", "Separation", "Process"]}'),
('heat_exchanger_model', 'B11', '{"heat_exchanger_model": ["Chemical", "Heat Transfer", "Process"]}'),
('reaction_kinetics_lab', 'B11', '{"reaction_kinetics_lab": ["Chemical", "Kinetics", "Research"]}'),
('process_safety_system', 'B11', '{"process_safety_system": ["Safety", "Chemical", "Process Control"]}'),
('crystallization_demo', 'B11', '{"crystallization_demo": ["Chemical", "Crystallization", "Separation"]}'),

('additive_manufacturing', 'B15', '{"additive_manufacturing": ["3D Printing", "Manufacturing", "Innovation"]}'),
('lean_manufacturing', 'B15', '{"lean_manufacturing": ["Manufacturing", "Efficiency", "Process Improvement"]}'),
('quality_control_station', 'B15', '{"quality_control_station": ["Quality", "Manufacturing", "Testing"]}'),
('assembly_line_model', 'B15', '{"assembly_line_model": ["Manufacturing", "Automation", "Production"]}'),
('ergonomics_workstation', 'B15', '{"ergonomics_workstation": ["Ergonomics", "Safety", "Human Factors"]}'),

('concrete_testing_lab', 'B6', '{"concrete_testing_lab": ["Civil", "Materials", "Testing"]}'),
('structural_analysis_model', 'B6', '{"structural_analysis_model": ["Civil", "Structural", "Analysis"]}'),
('seismic_simulation', 'B6', '{"seismic_simulation": ["Civil", "Earthquake", "Simulation"]}'),
('bridge_design_model', 'B6', '{"bridge_design_model": ["Civil", "Bridge", "Design"]}'),
('soil_mechanics_lab', 'B6', '{"soil_mechanics_lab": ["Civil", "Soil", "Geotechnical"]}'),

('composite_materials', 'B28', '{"composite_materials": ["Materials", "Composites", "Advanced Materials"]}'),
('metal_fatigue_testing', 'B28', '{"metal_fatigue_testing": ["Materials", "Testing", "Mechanical Properties"]}'),
('corrosion_analysis', 'B28', '{"corrosion_analysis": ["Materials", "Corrosion", "Analysis"]}'),
('material_characterization', 'B28', '{"material_characterization": ["Materials", "Characterization", "Analysis"]}'),
('nanomaterials_display', 'B28', '{"nanomaterials_display": ["Nanomaterials", "Advanced Materials", "Research"]}'),

('heat_engine_model', 'B29', '{"heat_engine_model": ["Thermodynamics", "Heat Engines", "Energy"]}'),
('refrigeration_cycle', 'B29', '{"refrigeration_cycle": ["Thermodynamics", "Refrigeration", "Cooling"]}'),
('gas_turbine_display', 'B29', '{"gas_turbine_display": ["Thermodynamics", "Turbines", "Power Generation"]}'),
('thermal_imaging_demo', 'B29', '{"thermal_imaging_demo": ["Thermodynamics", "Thermal Imaging", "Temperature"]}'),
('entropy_demonstration', 'B29', '{"entropy_demonstration": ["Thermodynamics", "Entropy", "Physics"]}'),

('wind_tunnel_model', 'B30', '{"wind_tunnel_model": ["Fluid Mechanics", "Aerodynamics", "Testing"]}'),
('pump_performance_test', 'B30', '{"pump_performance_test": ["Fluid Mechanics", "Pumps", "Performance"]}'),
('flow_visualization', 'B30', '{"flow_visualization": ["Fluid Mechanics", "Flow", "Visualization"]}'),
('hydraulic_systems_demo', 'B30', '{"hydraulic_systems_demo": ["Hydraulics", "Fluid Power", "Systems"]}'),
('turbulence_study', 'B30', '{"turbulence_study": ["Fluid Mechanics", "Turbulence", "Research"]}'),

('gps_surveying_equipment', 'B31', '{"gps_surveying_equipment": ["Surveying", "GPS", "Geomatics"]}'),
('drone_mapping_display', 'B31', '{"drone_mapping_display": ["Surveying", "Drones", "Mapping"]}'),
('theodolite_station', 'B31', '{"theodolite_station": ["Surveying", "Theodolite", "Measurement"]}'),
('soil_testing_equipment', 'B31', '{"soil_testing_equipment": ["Soil Testing", "Geotechnical", "Civil"]}'),
('topographic_mapping', 'B31', '{"topographic_mapping": ["Mapping", "Topography", "Surveying"]}'),

('calculus_visualization', 'B32', '{"calculus_visualization": ["Mathematics", "Calculus", "Visualization"]}'),
('linear_algebra_models', 'B32', '{"linear_algebra_models": ["Mathematics", "Linear Algebra", "Models"]}'),
('differential_equations', 'B32', '{"differential_equations": ["Mathematics", "Differential Equations", "Engineering"]}'),
('statistics_lab', 'B32', '{"statistics_lab": ["Mathematics", "Statistics", "Data Analysis"]}'),
('numerical_methods', 'B32', '{"numerical_methods": ["Mathematics", "Numerical Methods", "Computing"]}'),

('cad_workstations', 'B33', '{"cad_workstations": ["CAD", "Design", "Engineering Drawing"]}'),
('3d_modeling_station', 'B33', '{"3d_modeling_station": ["3D Modeling", "Design", "CAD"]}'),
('technical_drawing_board', 'B33', '{"technical_drawing_board": ["Technical Drawing", "Engineering Graphics", "Traditional"]}'),
('geometric_modeling', 'B33', '{"geometric_modeling": ["Geometric Modeling", "CAD", "Design"]}'),
('design_optimization', 'B33', '{"design_optimization": ["Design Optimization", "Engineering Design", "CAD"]}');

-- First, let's add more visitors to reach 200 unique visitors
INSERT INTO visitors (visitor_id, visitor_name, email, phone, visitor_type) VALUES
('V101', 'Andrew Mitchell', 'andrew.mitchell@example.com', '555-0201', 'student'),
('V102', 'Sarah Connor', 'sarah.connor@example.com', '555-0202', 'faculty'),
('V103', 'Mark Thompson', 'mark.thompson@example.com', '555-0203', 'general'),
('V104', 'Lisa Anderson', 'lisa.anderson@example.com', '555-0204', 'student'),
('V105', 'Robert Chen', 'robert.chen@example.com', '555-0205', 'faculty'),
('V106', 'Emma Rodriguez', 'emma.rodriguez@example.com', '555-0206', 'general'),
('V107', 'Michael Davis', 'michael.davis@example.com', '555-0207', 'student'),
('V108', 'Jennifer Wilson', 'jennifer.wilson@example.com', '555-0208', 'faculty'),
('V109', 'David Garcia', 'david.garcia@example.com', '555-0209', 'general'),
('V110', 'Ashley Martinez', 'ashley.martinez@example.com', '555-0210', 'student'),
('V111', 'Christopher Lee', 'christopher.lee@example.com', '555-0211', 'faculty'),
('V112', 'Amanda Brown', 'amanda.brown@example.com', '555-0212', 'general'),
('V113', 'Matthew Wilson', 'matthew.wilson@example.com', '555-0213', 'student'),
('V114', 'Jessica Taylor', 'jessica.taylor@example.com', '555-0214', 'faculty'),
('V115', 'Daniel Johnson', 'daniel.johnson@example.com', '555-0215', 'general'),
('V116', 'Nicole White', 'nicole.white@example.com', '555-0216', 'student'),
('V117', 'Ryan Harris', 'ryan.harris@example.com', '555-0217', 'faculty'),
('V118', 'Stephanie Clark', 'stephanie.clark@example.com', '555-0218', 'general'),
('V119', 'Kevin Lewis', 'kevin.lewis@example.com', '555-0219', 'student'),
('V120', 'Brittany Walker', 'brittany.walker@example.com', '555-0220', 'faculty'),
('V121', 'Brandon Hall', 'brandon.hall@example.com', '555-0221', 'general'),
('V122', 'Samantha Young', 'samantha.young@example.com', '555-0222', 'student'),
('V123', 'Justin King', 'justin.king@example.com', '555-0223', 'faculty'),
('V124', 'Rachel Wright', 'rachel.wright@example.com', '555-0224', 'general'),
('V125', 'Tyler Lopez', 'tyler.lopez@example.com', '555-0225', 'student'),
('V126', 'Megan Hill', 'megan.hill@example.com', '555-0226', 'faculty'),
('V127', 'Aaron Scott', 'aaron.scott@example.com', '555-0227', 'general'),
('V128', 'Kayla Green', 'kayla.green@example.com', '555-0228', 'student'),
('V129', 'Nathan Adams', 'nathan.adams@example.com', '555-0229', 'faculty'),
('V130', 'Allison Baker', 'allison.baker@example.com', '555-0230', 'general'),
('V131', 'Zachary Nelson', 'zachary.nelson@example.com', '555-0231', 'student'),
('V132', 'Lauren Carter', 'lauren.carter@example.com', '555-0232', 'faculty'),
('V133', 'Benjamin Mitchell', 'benjamin.mitchell@example.com', '555-0233', 'general'),
('V134', 'Hannah Perez', 'hannah.perez@example.com', '555-0234', 'student'),
('V135', 'Jacob Roberts', 'jacob.roberts@example.com', '555-0235', 'faculty'),
('V136', 'Alexis Turner', 'alexis.turner@example.com', '555-0236', 'general'),
('V137', 'Ethan Phillips', 'ethan.phillips@example.com', '555-0237', 'student'),
('V138', 'Grace Campbell', 'grace.campbell@example.com', '555-0238', 'faculty'),
('V139', 'Noah Parker', 'noah.parker@example.com', '555-0239', 'general'),
('V140', 'Chloe Evans', 'chloe.evans@example.com', '555-0240', 'student'),
('V141', 'Mason Edwards', 'mason.edwards@example.com', '555-0241', 'faculty'),
('V142', 'Olivia Collins', 'olivia.collins@example.com', '555-0242', 'general'),
('V143', 'Lucas Stewart', 'lucas.stewart@example.com', '555-0243', 'student'),
('V144', 'Emma Sanchez', 'emma.sanchez2@example.com', '555-0244', 'faculty'),
('V145', 'Alexander Morris', 'alexander.morris@example.com', '555-0245', 'general'),
('V146', 'Sophia Rogers', 'sophia.rogers@example.com', '555-0246', 'student'),
('V147', 'William Reed', 'william.reed@example.com', '555-0247', 'faculty'),
('V148', 'Isabella Cook', 'isabella.cook@example.com', '555-0248', 'general'),
('V149', 'James Morgan', 'james.morgan@example.com', '555-0249', 'student'),
('V150', 'Ava Bell', 'ava.bell@example.com', '555-0250', 'faculty'),
('V151', 'Benjamin Murphy', 'benjamin.murphy@example.com', '555-0251', 'general'),
('V152', 'Mia Bailey', 'mia.bailey@example.com', '555-0252', 'student'),
('V153', 'Henry Rivera', 'henry.rivera@example.com', '555-0253', 'faculty'),
('V154', 'Charlotte Cooper', 'charlotte.cooper@example.com', '555-0254', 'general'),
('V155', 'Sebastian Richardson', 'sebastian.richardson@example.com', '555-0255', 'student'),
('V156', 'Amelia Cox', 'amelia.cox@example.com', '555-0256', 'faculty'),
('V157', 'Owen Howard', 'owen.howard@example.com', '555-0257', 'general'),
('V158', 'Harper Ward', 'harper.ward@example.com', '555-0258', 'student'),
('V159', 'Theodore Torres', 'theodore.torres@example.com', '555-0259', 'faculty'),
('V160', 'Evelyn Peterson', 'evelyn.peterson@example.com', '555-0260', 'general'),
('V161', 'Jack Gray', 'jack.gray@example.com', '555-0261', 'student'),
('V162', 'Abigail Ramirez', 'abigail.ramirez@example.com', '555-0262', 'faculty'),
('V163', 'Connor James', 'connor.james@example.com', '555-0263', 'general'),
('V164', 'Emily Watson', 'emily.watson@example.com', '555-0264', 'student'),
('V165', 'Caleb Brooks', 'caleb.brooks@example.com', '555-0265', 'faculty'),
('V166', 'Madison Kelly', 'madison.kelly@example.com', '555-0266', 'general'),
('V167', 'Hunter Sanders', 'hunter.sanders@example.com', '555-0267', 'student'),
('V168', 'Elizabeth Price', 'elizabeth.price@example.com', '555-0268', 'faculty'),
('V169', 'Christian Bennett', 'christian.bennett@example.com', '555-0269', 'general'),
('V170', 'Avery Wood', 'avery.wood@example.com', '555-0270', 'student'),
('V171', 'Jonathan Barnes', 'jonathan.barnes@example.com', '555-0271', 'faculty'),
('V172', 'Ella Ross', 'ella.ross@example.com', '555-0272', 'general'),
('V173', 'Samuel Henderson', 'samuel.henderson@example.com', '555-0273', 'student'),
('V174', 'Scarlett Butler', 'scarlett.butler@example.com', '555-0274', 'faculty'),
('V175', 'David Coleman', 'david.coleman@example.com', '555-0275', 'general'),
('V176', 'Victoria Jenkins', 'victoria.jenkins@example.com', '555-0276', 'student'),
('V177', 'Joseph Perry', 'joseph.perry@example.com', '555-0277', 'faculty'),
('V178', 'Aria Powell', 'aria.powell@example.com', '555-0278', 'general'),
('V179', 'Luke Long', 'luke.long@example.com', '555-0279', 'student'),
('V180', 'Nora Patterson', 'nora.patterson@example.com', '555-0280', 'faculty'),
('V181', 'Gabriel Hughes', 'gabriel.hughes@example.com', '555-0281', 'general'),
('V182', 'Lily Flores', 'lily.flores@example.com', '555-0282', 'student'),
('V183', 'Anthony Washington', 'anthony.washington@example.com', '555-0283', 'faculty'),
('V184', 'Zoey Butler2', 'zoey.butler@example.com', '555-0284', 'general'),
('V185', 'Isaac Simmons', 'isaac.simmons@example.com', '555-0285', 'student'),
('V186', 'Penelope Foster', 'penelope.foster@example.com', '555-0286', 'faculty'),
('V187', 'Grayson Gonzales', 'grayson.gonzales@example.com', '555-0287', 'general'),
('V188', 'Riley Bryant', 'riley.bryant@example.com', '555-0288', 'student'),
('V189', 'Wyatt Alexander', 'wyatt.alexander@example.com', '555-0289', 'faculty'),
('V190', 'Leah Russell', 'leah.russell@example.com', '555-0290', 'general'),
('V191', 'Nathan Griffin', 'nathan.griffin@example.com', '555-0291', 'student'),
('V192', 'Layla Diaz', 'layla.diaz@example.com', '555-0292', 'faculty'),
('V193', 'Ian Hayes', 'ian.hayes@example.com', '555-0293', 'general'),
('V194', 'Maya Myers', 'maya.myers@example.com', '555-0294', 'student'),
('V195', 'Carter Ford', 'carter.ford@example.com', '555-0295', 'faculty'),
('V196', 'Aurora Cox2', 'aurora.cox@example.com', '555-0296', 'general'),
('V197', 'Levi Ward2', 'levi.ward@example.com', '555-0297', 'student'),
('V198', 'Nova Richardson2', 'nova.richardson@example.com', '555-0298', 'faculty'),
('V199', 'Kai Howard2', 'kai.howard@example.com', '555-0299', 'general'),
('V200', 'Sage Torres2', 'sage.torres@example.com', '555-0300', 'student');

-- Add extensive entry/exit logs for multiple buildings per visitor
INSERT INTO entry_exit_log (visitor_id, building_id, entry_time, exit_time, qr_code) VALUES
-- October 26, 2025 data
('V101', 'B1', '2025-10-26 08:00:00', '2025-10-26 10:30:00', 'QR101'),
('V101', 'B17', '2025-10-26 11:00:00', '2025-10-26 13:15:00', 'QR102'),
('V101', 'B20', '2025-10-26 14:00:00', '2025-10-26 16:30:00', 'QR103'),

('V102', 'B2', '2025-10-26 09:15:00', '2025-10-26 11:45:00', 'QR104'),
('V102', 'B34', '2025-10-26 12:30:00', '2025-10-26 15:00:00', 'QR105'),
('V102', 'B11', '2025-10-26 15:30:00', '2025-10-26 17:45:00', 'QR106'),

('V103', 'B6', '2025-10-26 08:30:00', '2025-10-26 11:00:00', 'QR107'),
('V103', 'B15', '2025-10-26 11:30:00', '2025-10-26 14:15:00', 'QR108'),
('V103', 'B28', '2025-10-26 14:45:00', '2025-10-26 17:30:00', 'QR109'),

('V104', 'B29', '2025-10-26 09:00:00', '2025-10-26 12:00:00', 'QR110'),
('V104', 'B30', '2025-10-26 13:00:00', '2025-10-26 15:45:00', 'QR111'),

('V105', 'B31', '2025-10-26 10:15:00', '2025-10-26 13:30:00', 'QR112'),
('V105', 'B32', '2025-10-26 14:00:00', '2025-10-26 16:45:00', 'QR113'),

('V106', 'B33', '2025-10-26 08:45:00', '2025-10-26 12:15:00', 'QR114'),
('V106', 'B22', '2025-10-26 13:00:00', '2025-10-26 16:00:00', 'QR115'),

('V107', 'B23', '2025-10-26 09:30:00', '2025-10-26 12:45:00', 'QR116'),
('V107', 'B1', '2025-10-26 13:30:00', '2025-10-26 16:15:00', 'QR117'),

('V108', 'B2', '2025-10-26 10:00:00', '2025-10-26 13:15:00', 'QR118'),
('V108', 'B17', '2025-10-26 14:00:00', '2025-10-26 17:00:00', 'QR119'),

('V109', 'B20', '2025-10-26 08:15:00', '2025-10-26 11:30:00', 'QR120'),
('V109', 'B34', '2025-10-26 12:15:00', '2025-10-26 15:30:00', 'QR121'),

('V110', 'B11', '2025-10-26 09:45:00', '2025-10-26 13:00:00', 'QR122'),
('V110', 'B15', '2025-10-26 14:00:00', '2025-10-26 17:15:00', 'QR123'),

-- October 27, 2025 data (today)
('V111', 'B6', '2025-10-27 08:00:00', '2025-10-27 11:15:00', 'QR124'),
('V111', 'B28', '2025-10-27 12:00:00', '2025-10-27 14:45:00', 'QR125'),

('V112', 'B29', '2025-10-27 08:30:00', '2025-10-27 11:45:00', 'QR126'),
('V112', 'B30', '2025-10-27 13:15:00', '2025-10-27 16:00:00', 'QR127'),

('V113', 'B31', '2025-10-27 09:00:00', '2025-10-27 12:30:00', 'QR128'),
('V113', 'B32', '2025-10-27 14:00:00', '2025-10-27 17:00:00', 'QR129'),

('V114', 'B33', '2025-10-27 09:30:00', '2025-10-27 13:00:00', 'QR130'),
('V114', 'B22', '2025-10-27 14:30:00', '2025-10-27 17:30:00', 'QR131'),

('V115', 'B23', '2025-10-27 08:15:00', '2025-10-27 11:00:00', 'QR132'),
('V115', 'B1', '2025-10-27 11:45:00', '2025-10-27 14:30:00', 'QR133'),

-- Multiple visitors across different days and buildings
('V116', 'B1', '2025-10-20 08:30:00', '2025-10-20 11:00:00', 'QR134'),
('V116', 'B2', '2025-10-20 11:30:00', '2025-10-20 14:15:00', 'QR135'),
('V116', 'B17', '2025-10-20 15:00:00', '2025-10-20 17:30:00', 'QR136'),

('V117', 'B20', '2025-10-21 09:00:00', '2025-10-21 12:30:00', 'QR137'),
('V117', 'B34', '2025-10-21 13:15:00', '2025-10-21 16:00:00', 'QR138'),

('V118', 'B11', '2025-10-22 08:45:00', '2025-10-22 12:00:00', 'QR139'),
('V118', 'B15', '2025-10-22 13:00:00', '2025-10-22 16:15:00', 'QR140'),
('V118', 'B6', '2025-10-22 16:45:00', '2025-10-22 18:30:00', 'QR141'),

('V119', 'B28', '2025-10-23 09:30:00', '2025-10-23 13:00:00', 'QR142'),
('V119', 'B29', '2025-10-23 14:00:00', '2025-10-23 17:15:00', 'QR143'),

('V120', 'B30', '2025-10-24 08:00:00', '2025-10-24 11:30:00', 'QR144'),
('V120', 'B31', '2025-10-24 12:15:00', '2025-10-24 15:45:00', 'QR145'),
('V120', 'B32', '2025-10-24 16:15:00', '2025-10-24 18:00:00', 'QR146'),

-- Continue with more visitors visiting multiple buildings...
('V121', 'B33', '2025-10-25 08:30:00', '2025-10-25 12:00:00', 'QR147'),
('V121', 'B22', '2025-10-25 13:00:00', '2025-10-25 16:30:00', 'QR148'),

('V122', 'B23', '2025-10-26 09:00:00', '2025-10-26 12:45:00', 'QR149'),
('V122', 'B1', '2025-10-26 14:00:00', '2025-10-26 17:00:00', 'QR150'),

('V123', 'B2', '2025-10-27 08:15:00', '2025-10-27 11:45:00', 'QR151'),
('V123', 'B17', '2025-10-27 12:30:00', '2025-10-27 15:30:00', 'QR152'),

-- Add more comprehensive data for remaining visitors
('V124', 'B20', '2025-10-20 10:00:00', '2025-10-20 13:15:00', 'QR153'),
('V125', 'B34', '2025-10-20 14:00:00', '2025-10-20 17:30:00', 'QR154'),
('V126', 'B11', '2025-10-21 08:30:00', '2025-10-21 12:00:00', 'QR155'),
('V127', 'B15', '2025-10-21 13:15:00', '2025-10-21 16:45:00', 'QR156'),
('V128', 'B6', '2025-10-22 09:00:00', '2025-10-22 12:30:00', 'QR157'),
('V129', 'B28', '2025-10-22 14:00:00', '2025-10-22 17:15:00', 'QR158'),
('V130', 'B29', '2025-10-23 08:45:00', '2025-10-23 12:15:00', 'QR159'),

-- Continue pattern for remaining visitors (V131-V200)
-- Each visitor visits 1-3 buildings on different days
('V131', 'B30', '2025-10-23 13:30:00', '2025-10-23 16:30:00', 'QR160'),
('V132', 'B31', '2025-10-24 09:15:00', '2025-10-24 13:00:00', 'QR161'),
('V133', 'B32', '2025-10-24 14:15:00', '2025-10-24 17:45:00', 'QR162'),
('V134', 'B33', '2025-10-25 08:00:00', '2025-10-25 11:30:00', 'QR163'),
('V135', 'B22', '2025-10-25 12:45:00', '2025-10-25 16:15:00', 'QR164'),
('V136', 'B23', '2025-10-26 09:30:00', '2025-10-26 13:15:00', 'QR165'),
('V137', 'B1', '2025-10-26 14:30:00', '2025-10-26 17:45:00', 'QR166'),
('V138', 'B2', '2025-10-27 08:45:00', '2025-10-27 12:30:00', 'QR167'),
('V139', 'B17', '2025-10-27 13:45:00', '2025-10-27 17:00:00', 'QR168'),
('V140', 'B20', '2025-10-20 11:30:00', '2025-10-20 15:00:00', 'QR169'),

-- Additional entries for comprehensive coverage
('V141', 'B34', '2025-10-21 10:15:00', '2025-10-21 14:00:00', 'QR170'),
('V142', 'B11', '2025-10-22 12:00:00', '2025-10-22 15:30:00', 'QR171'),
('V143', 'B15', '2025-10-23 09:45:00', '2025-10-23 13:30:00', 'QR172'),
('V144', 'B6', '2025-10-24 11:00:00', '2025-10-24 14:45:00', 'QR173'),
('V145', 'B28', '2025-10-25 13:15:00', '2025-10-25 17:00:00', 'QR174'),

-- Some visitors currently inside buildings (no exit time)
('V146', 'B29', '2025-10-27 09:00:00', NULL, 'QR175'),
('V147', 'B30', '2025-10-27 10:30:00', NULL, 'QR176'),
('V148', 'B31', '2025-10-27 11:15:00', NULL, 'QR177'),
('V149', 'B32', '2025-10-27 13:00:00', NULL, 'QR178'),
('V150', 'B33', '2025-10-27 14:30:00', NULL, 'QR179'),

-- More entries for remaining visitors (sample pattern)
('V151', 'B1', '2025-10-20 08:00:00', '2025-10-20 11:45:00', 'QR180'),
('V152', 'B2', '2025-10-20 12:30:00', '2025-10-20 16:00:00', 'QR181'),
('V153', 'B17', '2025-10-21 09:15:00', '2025-10-21 13:30:00', 'QR182'),
('V154', 'B20', '2025-10-21 14:15:00', '2025-10-21 17:30:00', 'QR183'),
('V155', 'B34', '2025-10-22 08:30:00', '2025-10-22 12:15:00', 'QR184'),

-- Continue this pattern for all remaining visitors up to V200
('V156', 'B11', '2025-10-22 13:00:00', '2025-10-22 16:45:00', 'QR185'),
('V157', 'B15', '2025-10-23 10:00:00', '2025-10-23 14:30:00', 'QR186'),
('V158', 'B6', '2025-10-23 15:15:00', '2025-10-23 18:00:00', 'QR187'),
('V159', 'B28', '2025-10-24 08:15:00', '2025-10-24 12:00:00', 'QR188'),
('V160', 'B29', '2025-10-24 13:30:00', '2025-10-24 17:15:00', 'QR189'),

-- Final batch of visitors
('V161', 'B30', '2025-10-25 09:45:00', '2025-10-25 13:15:00', 'QR190'),
('V162', 'B31', '2025-10-25 14:45:00', '2025-10-25 18:30:00', 'QR191'),
('V163', 'B32', '2025-10-26 08:00:00', '2025-10-26 11:30:00', 'QR192'),
('V164', 'B33', '2025-10-26 12:15:00', '2025-10-26 16:00:00', 'QR193'),
('V165', 'B22', '2025-10-27 08:30:00', '2025-10-27 12:45:00', 'QR194'),

-- Multiple building visits for some users
('V166', 'B23', '2025-10-20 09:00:00', '2025-10-20 12:30:00', 'QR195'),
('V166', 'B1', '2025-10-20 14:00:00', '2025-10-20 17:15:00', 'QR196'),

('V167', 'B2', '2025-10-21 08:45:00', '2025-10-21 12:15:00', 'QR197'),
('V167', 'B17', '2025-10-21 13:30:00', '2025-10-21 16:45:00', 'QR198'),

('V168', 'B20', '2025-10-22 10:30:00', '2025-10-22 14:00:00', 'QR199'),
('V168', 'B34', '2025-10-22 15:00:00', '2025-10-22 18:15:00', 'QR200'),

-- Continue for remaining visitors V169-V200
('V169', 'B11', '2025-10-23 08:00:00', '2025-10-23 11:45:00', 'QR201'),
('V170', 'B15', '2025-10-23 13:15:00', '2025-10-23 17:00:00', 'QR202'),
('V171', 'B6', '2025-10-24 09:30:00', '2025-10-24 13:45:00', 'QR203'),
('V172', 'B28', '2025-10-24 14:30:00', '2025-10-24 18:00:00', 'QR204'),
('V173', 'B29', '2025-10-25 08:15:00', '2025-10-25 12:00:00', 'QR205'),
('V174', 'B30', '2025-10-25 13:30:00', '2025-10-25 17:30:00', 'QR206'),
('V175', 'B31', '2025-10-26 09:15:00', '2025-10-26 13:00:00', 'QR207'),
('V176', 'B32', '2025-10-26 14:15:00', '2025-10-26 17:45:00', 'QR208'),
('V177', 'B33', '2025-10-27 08:00:00', '2025-10-27 11:30:00', 'QR209'),
('V178', 'B22', '2025-10-27 12:45:00', '2025-10-27 16:15:00', 'QR210'),
('V179', 'B23', '2025-10-20 11:00:00', '2025-10-20 14:30:00', 'QR211'),
('V180', 'B1', '2025-10-21 12:30:00', '2025-10-21 16:00:00', 'QR212'),
('V181', 'B2', '2025-10-22 08:30:00', '2025-10-22 12:45:00', 'QR213'),
('V182', 'B17', '2025-10-23 11:15:00', '2025-10-23 15:30:00', 'QR214'),
('V183', 'B20', '2025-10-24 12:00:00', '2025-10-24 16:15:00', 'QR215'),
('V184', 'B34', '2025-10-25 09:45:00', '2025-10-25 14:00:00', 'QR216'),
('V185', 'B11', '2025-10-26 11:30:00', '2025-10-26 15:15:00', 'QR217'),
('V186', 'B15', '2025-10-27 10:00:00', '2025-10-27 14:15:00', 'QR218'),
('V187', 'B6', '2025-10-20 13:15:00', '2025-10-20 17:00:00', 'QR219'),
('V188', 'B28', '2025-10-21 08:00:00', '2025-10-21 12:30:00', 'QR220'),
('V189', 'B29', '2025-10-22 14:45:00', '2025-10-22 18:15:00', 'QR221'),
('V190', 'B30', '2025-10-23 09:30:00', '2025-10-23 13:45:00', 'QR222'),
('V191', 'B31', '2025-10-24 10:15:00', '2025-10-24 14:30:00', 'QR223'),
('V192', 'B32', '2025-10-25 11:45:00', '2025-10-25 16:00:00', 'QR224'),
('V193', 'B33', '2025-10-26 13:00:00', '2025-10-26 17:30:00', 'QR225'),
('V194', 'B22', '2025-10-27 09:15:00', '2025-10-27 13:30:00', 'QR226'),
('V195', 'B23', '2025-10-20 14:00:00', '2025-10-20 17:45:00', 'QR227'),
('V196', 'B1', '2025-10-21 10:30:00', '2025-10-21 14:45:00', 'QR228'),
('V197', 'B2', '2025-10-22 12:15:00', '2025-10-22 16:30:00', 'QR229'),
('V198', 'B17', '2025-10-23 08:45:00', '2025-10-23 13:00:00', 'QR230'),
('V199', 'B20', '2025-10-24 15:30:00', '2025-10-24 19:00:00', 'QR231'),
('V200', 'B34', '2025-10-25 12:00:00', '2025-10-25 16:45:00', 'QR232');

-- Add a table to track average visit times per building
CREATE TABLE IF NOT EXISTS building_visit_stats (
    building_id VARCHAR(10) PRIMARY KEY,
    avg_visit_duration INTERVAL,
    total_visits INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE
);

-- Create triggers to automatically update daily visitor counts and building statistics

-- Function to update daily visitor counts
CREATE OR REPLACE FUNCTION update_daily_visitor_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT (new entry)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO daily_visitor_counts (building_id, visit_date, total_visitors, unique_visitors)
        VALUES (
            NEW.building_id,
            DATE(NEW.entry_time),
            1,
            1
        )
        ON CONFLICT (building_id, visit_date)
        DO UPDATE SET
            total_visitors = daily_visitor_counts.total_visitors + 1,
            unique_visitors = (
                SELECT COUNT(DISTINCT visitor_id)
                FROM entry_exit_log
                WHERE building_id = NEW.building_id
                AND DATE(entry_time) = DATE(NEW.entry_time)
            ),
            updated_at = CURRENT_TIMESTAMP;
            
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE (exit time added)
    IF TG_OP = 'UPDATE' AND OLD.exit_time IS NULL AND NEW.exit_time IS NOT NULL THEN
        -- Update building visit statistics when someone exits
        INSERT INTO building_visit_stats (building_id, avg_visit_duration, total_visits)
        VALUES (
            NEW.building_id,
            NEW.session_duration,
            1
        )
        ON CONFLICT (building_id)
        DO UPDATE SET
            avg_visit_duration = (
                SELECT AVG(session_duration)
                FROM entry_exit_log
                WHERE building_id = NEW.building_id
                AND exit_time IS NOT NULL
                AND session_duration IS NOT NULL
            ),
            total_visits = building_visit_stats.total_visits + 1,
            last_updated = CURRENT_TIMESTAMP;
            
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for entry/exit log updates
DROP TRIGGER IF EXISTS trigger_update_visitor_counts ON entry_exit_log;
CREATE TRIGGER trigger_update_visitor_counts
    AFTER INSERT OR UPDATE ON entry_exit_log
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_visitor_counts();

-- Function to update current status based on active visitors
CREATE OR REPLACE FUNCTION update_current_building_status()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    capacity INTEGER;
    status_color VARCHAR(20);
BEGIN
    -- Get current count of people in the building
    SELECT COUNT(*)
    INTO current_count
    FROM entry_exit_log
    WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
    AND exit_time IS NULL;
    
    -- Get building capacity
    SELECT building_capacity
    INTO capacity
    FROM buildings
    WHERE building_id = COALESCE(NEW.building_id, OLD.building_id);
    
    -- Determine color based on occupancy percentage
    IF current_count = 0 THEN
        status_color := 'gray';
    ELSIF current_count::FLOAT / capacity < 0.5 THEN
        status_color := 'green';
    ELSIF current_count::FLOAT / capacity < 0.75 THEN
        status_color := 'yellow';
    ELSIF current_count::FLOAT / capacity < 0.9 THEN
        status_color := 'orange';
    ELSE
        status_color := 'red';
    END IF;
    
    -- Update current status
    INSERT INTO current_status (building_id, current_crowd, color)
    VALUES (COALESCE(NEW.building_id, OLD.building_id), current_count, status_color)
    ON CONFLICT (building_id)
    DO UPDATE SET
        current_crowd = current_count,
        color = status_color,
        status_timestamp = CURRENT_TIMESTAMP::VARCHAR;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for current status updates
DROP TRIGGER IF EXISTS trigger_update_current_status ON entry_exit_log;
CREATE TRIGGER trigger_update_current_status
    AFTER INSERT OR UPDATE OR DELETE ON entry_exit_log
    FOR EACH ROW
    EXECUTE FUNCTION update_current_building_status();

-- Manually trigger the functions to populate initial data
DO $$
DECLARE
    building_rec RECORD;
    date_rec DATE;
BEGIN
    -- Populate daily visitor counts for existing data
    FOR date_rec IN SELECT DISTINCT DATE(entry_time) FROM entry_exit_log LOOP
        FOR building_rec IN SELECT DISTINCT building_id FROM entry_exit_log WHERE DATE(entry_time) = date_rec LOOP
            INSERT INTO daily_visitor_counts (building_id, visit_date, total_visitors, unique_visitors)
            VALUES (
                building_rec.building_id,
                date_rec,
                (SELECT COUNT(*) FROM entry_exit_log WHERE building_id = building_rec.building_id AND DATE(entry_time) = date_rec),
                (SELECT COUNT(DISTINCT visitor_id) FROM entry_exit_log WHERE building_id = building_rec.building_id AND DATE(entry_time) = date_rec)
            )
            ON CONFLICT (building_id, visit_date) DO NOTHING;
        END LOOP;
    END LOOP;
    
    -- Populate building visit stats for existing data
    FOR building_rec IN SELECT DISTINCT building_id FROM entry_exit_log WHERE exit_time IS NOT NULL LOOP
        INSERT INTO building_visit_stats (building_id, avg_visit_duration, total_visits)
        VALUES (
            building_rec.building_id,
            (SELECT AVG(session_duration) FROM entry_exit_log WHERE building_id = building_rec.building_id AND exit_time IS NOT NULL),
            (SELECT COUNT(*) FROM entry_exit_log WHERE building_id = building_rec.building_id AND exit_time IS NOT NULL)
        )
        ON CONFLICT (building_id) DO UPDATE SET
            avg_visit_duration = EXCLUDED.avg_visit_duration,
            total_visits = EXCLUDED.total_visits,
            last_updated = CURRENT_TIMESTAMP;
    END LOOP;
END $$;

-- Update current status for all buildings
INSERT INTO current_status (building_id, current_crowd, color)
SELECT 
    b.building_id,
    COALESCE(active_count.count, 0) as current_crowd,
    CASE 
        WHEN COALESCE(active_count.count, 0) = 0 THEN 'gray'
        WHEN COALESCE(active_count.count, 0)::FLOAT / b.building_capacity < 0.5 THEN 'green'
        WHEN COALESCE(active_count.count, 0)::FLOAT / b.building_capacity < 0.75 THEN 'yellow'
        WHEN COALESCE(active_count.count, 0)::FLOAT / b.building_capacity < 0.9 THEN 'orange'
        ELSE 'red'
    END as color
FROM buildings b
LEFT JOIN (
    SELECT 
        building_id, 
        COUNT(*) as count
    FROM entry_exit_log 
    WHERE exit_time IS NULL 
    GROUP BY building_id
) active_count ON b.building_id = active_count.building_id
ON CONFLICT (building_id) DO UPDATE SET
    current_crowd = EXCLUDED.current_crowd,
    color = EXCLUDED.color,
    status_timestamp = CURRENT_TIMESTAMP::VARCHAR;