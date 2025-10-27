// search.js
// Enhanced search function for the backend database
// This will replace the frontend buildingData.js when backend is connected

// Function to fetch building data from API and update exhibits dynamically
async function fetchBuildingDataFromAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/buildings');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiBuildings = await response.json();
    return apiBuildings;
  } catch (error) {
    console.error('Error fetching building data from API:', error);
    return null;
  }
}

// Function to merge API data with static zone configuration
function mergeBuildingData(apiBuildings) {
  // Static zone mapping - keeping zone IDs static as requested
  const staticZoneMapping = {
    "B1": 1, "B2": 1, "B17": 1, "B20": 1, "B34": 1,  // Zone 1
    "B6": 2, "B15": 2, "B31": 2,                       // Zone 2  
    "B11": 3, "B28": 3, "B29": 3, "B30": 3,           // Zone 3
    "B32": 4, "B33": 4                                 // Zone 4
  };
  
  // Static coordinates mapping
  const staticCoordinates = {
    "B1": [7.253750, 80.592028], "B2": [7.253800, 80.592100], 
    "B6": [7.253850, 80.592150], "B11": [7.253900, 80.592200],
    "B15": [7.253950, 80.592250], "B17": [7.254000, 80.592300],
    "B20": [7.254050, 80.592350], "B28": [7.254100, 80.592400],
    "B29": [7.254150, 80.592450], "B30": [7.254200, 80.592500],
    "B31": [7.254250, 80.592550], "B32": [7.254300, 80.592600],
    "B33": [7.254350, 80.592650], "B34": [7.254400, 80.592700]
  };
  
  return apiBuildings
    .filter(building => building.exhibits && building.exhibits.length > 0) // Only buildings with exhibits
    .map(building => ({
      building_ID: building.building_id,
      zone_ID: staticZoneMapping[building.building_id] || 1, // Default to zone 1 if not mapped
      building_name: building.building_name,
      description: generateBuildingDescription(building),
      exhibits: building.exhibits || [],
      coordinates: staticCoordinates[building.building_id] || [7.254000, 80.592000], // Default coordinates
      svg_id: building.building_id,
      building_capacity: building.building_capacity
    }));
}

// Helper function to generate building description based on exhibits
function generateBuildingDescription(building) {
  if (!building.exhibits || building.exhibits.length === 0) {
    return `${building.building_name} - Engineering facility`;
  }
  
  const exhibitCount = building.exhibits.length;
  const departmentType = building.building_name.toLowerCase();
  
  if (departmentType.includes('computer')) {
    return `Computer engineering department with AI, cybersecurity, and software development showcases featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('electronic')) {
    return `Electronics laboratory featuring robotics, IoT systems, and advanced electronic circuits with ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('chemical')) {
    return `Chemical engineering department showcasing process control, safety systems, and reaction kinetics with ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('manufacturing')) {
    return `Manufacturing engineering with 3D printing, robotics, and industrial automation systems featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('materials')) {
    return `Materials science laboratory with advanced materials testing and characterization equipment featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('thermodynamics')) {
    return `Thermodynamics laboratory featuring heat engines, thermal imaging, and energy systems with ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('fluids')) {
    return `Fluid mechanics laboratory with wind tunnel, pump testing, and flow visualization systems featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('structure')) {
    return `Civil engineering structural testing laboratory with seismic simulation and materials testing featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('carpentry')) {
    return `Engineering carpentry workshop with traditional woodworking tools and modern manufacturing techniques featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('workshop')) {
    return `Main engineering workshop featuring manufacturing processes, automation, and mechanical systems with ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('surveying')) {
    return `Surveying and geotechnical laboratory with modern mapping and soil testing equipment featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('mathematics')) {
    return `Engineering mathematics department with statistical analysis and numerical methods demonstrations featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('drawing')) {
    return `Technical drawing and CAD laboratory with design optimization and 3D modeling stations featuring ${exhibitCount} exhibits.`;
  } else if (departmentType.includes('electrical')) {
    return `Electrical and electronic engineering department featuring power systems, renewable energy, and smart grid technology with ${exhibitCount} exhibits.`;
  }
  
  return `${building.building_name} featuring ${exhibitCount} engineering exhibits and demonstrations.`;
}

// Enhanced search function with improved logic and database schema format
async function searchDatabase(query, { category, zone, subzone } = {}) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.trim().toLowerCase();
  let results = [];
  
  // Try to fetch real data from API, fallback to static data if API fails
  let buildingsData;
  try {
    const apiData = await fetchBuildingDataFromAPI();
    if (apiData && apiData.length > 0) {
      buildingsData = mergeBuildingData(apiData);
    } else {
      throw new Error('No data from API');
    }
  } catch (error) {
    console.warn('Using fallback static data:', error.message);
    // Fallback to static data
    buildingsData = [
    {
      building_ID: "B1",
      zone_ID: 1,
      building_name: "Engineering Carpentry Shop",
      description: "Engineering carpentry workshop with traditional woodworking tools and modern manufacturing techniques.",
      exhibits: ["asss", "carpentry_tools", "wood_joint_display", "woodworking_station"],
      coordinates: [7.253750, 80.592028],
      svg_id: "B1",
      building_capacity: 85
    },
    {
      building_ID: "B2",
      zone_ID: 1,
      building_name: "Engineering Workshop",
      description: "Main engineering workshop featuring manufacturing processes, automation, and mechanical systems.",
      exhibits: ["metal_fabrication", "kiosk", "cnc_machine", "metal_casting_process", "hydraulic_press_demo", "pneumatic_systems", "laser_cutting_display", "advanced_cnc_machining", "welding_demo"],
      coordinates: [7.253800, 80.592100],
      svg_id: "B2",
      building_capacity: 85
    },
    {
      building_ID: "B6",
      zone_ID: 2,
      building_name: "Structure Lab",
      description: "Civil engineering structural testing laboratory with seismic simulation and materials testing.",
      exhibits: ["soil_mechanics_lab", "bridge_design_model", "load_testing", "structural_model", "concrete_testing_lab", "structural_analysis_model", "seismic_simulation"],
      coordinates: [7.253850, 80.592150],
      svg_id: "B6",
      building_capacity: 60
    },
    {
      building_ID: "B11",
      zone_ID: 3,
      building_name: "Department of Chemical and process Engineering",
      description: "Chemical engineering department showcasing process control, safety systems, and reaction kinetics.",
      exhibits: ["process_safety_system", "reaction_kinetics_lab", "heat_exchanger_model", "distillation_column", "chemical_process", "chemical_reactor", "process_control", "crystallization_demo"],
      coordinates: [7.253900, 80.592200],
      svg_id: "B11",
      building_capacity: 80
    },
    {
      building_ID: "B15",
      zone_ID: 2,
      building_name: "Department of Manufacturing and Industrial Engineering",
      description: "Manufacturing engineering with 3D printing, robotics, and industrial automation systems.",
      exhibits: ["3d_printer", "industrial_robotics", "assembly_line_model", "lean_manufacturing", "additive_manufacturing", "quality_control_station", "ergonomics_workstation"],
      coordinates: [7.253950, 80.592250],
      svg_id: "B15",
      building_capacity: 80
    },
    {
      building_ID: "B17",
      zone_ID: 1,
      building_name: "Electronic Lab",
      description: "Electronics laboratory featuring robotics, IoT systems, and advanced electronic circuits.",
      exhibits: ["microcontroller_projects", "robotics_arm", "circuit_boards", "sensor_network", "robotics_display", "iot_sensor_network", "pcb_design_station", "signal_processing_lab", "wireless_communication"],
      coordinates: [7.254000, 80.592300],
      svg_id: "B17",
      building_capacity: 130
    },
    {
      building_ID: "B20",
      zone_ID: 1,
      building_name: "Department of Computer Engineering",
      description: "Computer engineering department with AI, cybersecurity, and software development showcases.",
      exhibits: ["programming_showcase", "microprocessor_demo", "cybersecurity_lab", "web_development_showcase", "machine_learning_demo", "ai_chatbot", "computer_vision_system", "database_management"],
      coordinates: [7.254050, 80.592350],
      svg_id: "B20",
      building_capacity: 130
    },
    {
      building_ID: "B28",
      zone_ID: 3,
      building_name: "Materials Lab",
      description: "Materials science laboratory with advanced materials testing and characterization equipment.",
      exhibits: ["material_characterization", "nanomaterials_display", "composite_materials", "metal_fatigue_testing", "corrosion_analysis"],
      coordinates: [7.254100, 80.592400],
      svg_id: "B28",
      building_capacity: 140
    },
    {
      building_ID: "B29",
      zone_ID: 3,
      building_name: "Thermodynamics Lab",
      description: "Thermodynamics laboratory featuring heat engines, thermal imaging, and energy systems.",
      exhibits: ["refrigeration_cycle", "gas_turbine_display", "thermal_imaging_demo", "entropy_demonstration", "heat_engine_model"],
      coordinates: [7.254150, 80.592450],
      svg_id: "B29",
      building_capacity: 140
    },
    {
      building_ID: "B30",
      zone_ID: 3,
      building_name: "Fluids Lab",
      description: "Fluid mechanics laboratory with wind tunnel, pump testing, and flow visualization systems.",
      exhibits: ["wind_tunnel_model", "pump_performance_test", "flow_visualization", "hydraulic_systems_demo", "turbulence_study"],
      coordinates: [7.254200, 80.592500],
      svg_id: "B30",
      building_capacity: 140
    },
    {
      building_ID: "B31",
      zone_ID: 2,
      building_name: "Surveying and Soil Lab",
      description: "Surveying and geotechnical laboratory with modern mapping and soil testing equipment.",
      exhibits: ["theodolite_station", "soil_testing_equipment", "topographic_mapping", "drone_mapping_display", "gps_surveying_equipment"],
      coordinates: [7.254250, 80.592550],
      svg_id: "B31",
      building_capacity: 140
    },
    {
      building_ID: "B32",
      zone_ID: 4,
      building_name: "Department of Engineering Mathematics",
      description: "Engineering mathematics department with statistical analysis and numerical methods demonstrations.",
      exhibits: ["differential_equations", "statistics_lab", "numerical_methods", "calculus_visualization", "linear_algebra_models"],
      coordinates: [7.254300, 80.592600],
      svg_id: "B32",
      building_capacity: 100
    },
    {
      building_ID: "B33",
      zone_ID: 4,
      building_name: "Drawing Office 1",
      description: "Technical drawing and CAD laboratory with design optimization and 3D modeling stations.",
      exhibits: ["technical_drawing_board", "geometric_modeling", "design_optimization", "cad_workstations", "3d_modeling_station"],
      coordinates: [7.254350, 80.592650],
      svg_id: "B33",
      building_capacity: 200
    },
    {
      building_ID: "B34",
      zone_ID: 1,
      building_name: "Department of Electrical and Electronic Engineering",
      description: "Electrical and electronic engineering department featuring power systems, renewable energy, and smart grid technology.",
      exhibits: ["transformer_display", "power_systems", "renewable_energy", "smart_grid", "power_electronics", "motor_control_systems", "solar_panel_array", "electrical_safety_demo"],
      coordinates: [7.254400, 80.592700],
      svg_id: "B34",
      building_capacity: 150
    }
  ];
  }
  
  // Enhanced search logic with improved matching
  buildingsData.forEach((building) => {
    const matchesQuery = 
      building.building_name?.toLowerCase().includes(searchTerm) ||
      building.description?.toLowerCase().includes(searchTerm) ||
      building.exhibits?.some(exhibit => exhibit.toLowerCase().includes(searchTerm));
    
    if (matchesQuery) {
      // Check zone filter if provided
      if (zone && zone !== 'all') {
        if (building.zone_ID !== parseInt(zone)) return;
      }
      
      // Add building to results
      results.push({
        id: building.building_ID,
        name: building.building_name,
        category: 'Building',
        description: building.description,
        buildingId: building.building_ID,
        buildingName: building.building_name,
        svgBuildingId: building.svg_id,
        zoneId: building.zone_ID,
        coordinates: building.coordinates,
        exhibits: building.exhibits || [],
        type: 'building'
      });
      
      // Add exhibits from this building that match the search
      if (building.exhibits) {
        building.exhibits.forEach((exhibit, index) => {
          if (exhibit.toLowerCase().includes(searchTerm)) {
            results.push({
              id: `${building.building_ID}-exhibit-${index}`,
              name: exhibit,
              category: 'Exhibits',
              description: `Exhibit in ${building.building_name}`,
              buildingId: building.building_ID,
              buildingName: building.building_name,
              svgBuildingId: building.svg_id,
              zoneId: building.zone_ID,
              coordinates: building.coordinates,
              type: 'exhibit'
            });
          }
        });
      }
    }
  });
  
  // Remove duplicates and limit results
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );
  
  return uniqueResults.slice(0, 20); // Limit to 20 results
}

// Helper function to get building by ID
async function getBuildingById(buildingId) {
  // Try to fetch real data from API, fallback to static data if API fails
  let buildingsData;
  try {
    const apiData = await fetchBuildingDataFromAPI();
    if (apiData && apiData.length > 0) {
      buildingsData = mergeBuildingData(apiData);
    } else {
      throw new Error('No data from API');
    }
  } catch (error) {
    console.warn('Using fallback static data:', error.message);
    // Fallback to static data
    buildingsData = [
    {
      building_ID: "B1",
      zone_ID: 1,
      building_name: "Engineering Carpentry Shop",
      description: "Engineering carpentry workshop with traditional woodworking tools and modern manufacturing techniques.",
      exhibits: ["asss", "carpentry_tools", "wood_joint_display", "woodworking_station"],
      coordinates: [7.253750, 80.592028],
      svg_id: "B1",
      building_capacity: 85
    },
    {
      building_ID: "B2",
      zone_ID: 1,
      building_name: "Engineering Workshop",
      description: "Main engineering workshop featuring manufacturing processes, automation, and mechanical systems.",
      exhibits: ["metal_fabrication", "kiosk", "cnc_machine", "metal_casting_process", "hydraulic_press_demo", "pneumatic_systems", "laser_cutting_display", "advanced_cnc_machining", "welding_demo"],
      coordinates: [7.253800, 80.592100],
      svg_id: "B2",
      building_capacity: 85
    },
    {
      building_ID: "B6",
      zone_ID: 2,
      building_name: "Structure Lab",
      description: "Civil engineering structural testing laboratory with seismic simulation and materials testing.",
      exhibits: ["soil_mechanics_lab", "bridge_design_model", "load_testing", "structural_model", "concrete_testing_lab", "structural_analysis_model", "seismic_simulation"],
      coordinates: [7.253850, 80.592150],
      svg_id: "B6",
      building_capacity: 60
    },
    {
      building_ID: "B11",
      zone_ID: 3,
      building_name: "Department of Chemical and process Engineering",
      description: "Chemical engineering department showcasing process control, safety systems, and reaction kinetics.",
      exhibits: ["process_safety_system", "reaction_kinetics_lab", "heat_exchanger_model", "distillation_column", "chemical_process", "chemical_reactor", "process_control", "crystallization_demo"],
      coordinates: [7.253900, 80.592200],
      svg_id: "B11",
      building_capacity: 80
    },
    {
      building_ID: "B15",
      zone_ID: 2,
      building_name: "Department of Manufacturing and Industrial Engineering",
      description: "Manufacturing engineering with 3D printing, robotics, and industrial automation systems.",
      exhibits: ["3d_printer", "industrial_robotics", "assembly_line_model", "lean_manufacturing", "additive_manufacturing", "quality_control_station", "ergonomics_workstation"],
      coordinates: [7.253950, 80.592250],
      svg_id: "B15",
      building_capacity: 80
    },
    {
      building_ID: "B17",
      zone_ID: 1,
      building_name: "Electronic Lab",
      description: "Electronics laboratory featuring robotics, IoT systems, and advanced electronic circuits.",
      exhibits: ["microcontroller_projects", "robotics_arm", "circuit_boards", "sensor_network", "robotics_display", "iot_sensor_network", "pcb_design_station", "signal_processing_lab", "wireless_communication"],
      coordinates: [7.254000, 80.592300],
      svg_id: "B17",
      building_capacity: 130
    },
    {
      building_ID: "B20",
      zone_ID: 1,
      building_name: "Department of Computer Engineering",
      description: "Computer engineering department with AI, cybersecurity, and software development showcases.",
      exhibits: ["programming_showcase", "microprocessor_demo", "cybersecurity_lab", "web_development_showcase", "machine_learning_demo", "ai_chatbot", "computer_vision_system", "database_management"],
      coordinates: [7.254050, 80.592350],
      svg_id: "B20",
      building_capacity: 130
    },
    {
      building_ID: "B28",
      zone_ID: 3,
      building_name: "Materials Lab",
      description: "Materials science laboratory with advanced materials testing and characterization equipment.",
      exhibits: ["material_characterization", "nanomaterials_display", "composite_materials", "metal_fatigue_testing", "corrosion_analysis"],
      coordinates: [7.254100, 80.592400],
      svg_id: "B28",
      building_capacity: 140
    },
    {
      building_ID: "B29",
      zone_ID: 3,
      building_name: "Thermodynamics Lab",
      description: "Thermodynamics laboratory featuring heat engines, thermal imaging, and energy systems.",
      exhibits: ["refrigeration_cycle", "gas_turbine_display", "thermal_imaging_demo", "entropy_demonstration", "heat_engine_model"],
      coordinates: [7.254150, 80.592450],
      svg_id: "B29",
      building_capacity: 140
    },
    {
      building_ID: "B30",
      zone_ID: 3,
      building_name: "Fluids Lab",
      description: "Fluid mechanics laboratory with wind tunnel, pump testing, and flow visualization systems.",
      exhibits: ["wind_tunnel_model", "pump_performance_test", "flow_visualization", "hydraulic_systems_demo", "turbulence_study"],
      coordinates: [7.254200, 80.592500],
      svg_id: "B30",
      building_capacity: 140
    },
    {
      building_ID: "B31",
      zone_ID: 2,
      building_name: "Surveying and Soil Lab",
      description: "Surveying and geotechnical laboratory with modern mapping and soil testing equipment.",
      exhibits: ["theodolite_station", "soil_testing_equipment", "topographic_mapping", "drone_mapping_display", "gps_surveying_equipment"],
      coordinates: [7.254250, 80.592550],
      svg_id: "B31",
      building_capacity: 140
    },
    {
      building_ID: "B32",
      zone_ID: 4,
      building_name: "Department of Engineering Mathematics",
      description: "Engineering mathematics department with statistical analysis and numerical methods demonstrations.",
      exhibits: ["differential_equations", "statistics_lab", "numerical_methods", "calculus_visualization", "linear_algebra_models"],
      coordinates: [7.254300, 80.592600],
      svg_id: "B32",
      building_capacity: 100
    },
    {
      building_ID: "B33",
      zone_ID: 4,
      building_name: "Drawing Office 1",
      description: "Technical drawing and CAD laboratory with design optimization and 3D modeling stations.",
      exhibits: ["technical_drawing_board", "geometric_modeling", "design_optimization", "cad_workstations", "3d_modeling_station"],
      coordinates: [7.254350, 80.592650],
      svg_id: "B33",
      building_capacity: 200
    },
    {
      building_ID: "B34",
      zone_ID: 1,
      building_name: "Department of Electrical and Electronic Engineering",
      description: "Electrical and electronic engineering department featuring power systems, renewable energy, and smart grid technology.",
      exhibits: ["transformer_display", "power_systems", "renewable_energy", "smart_grid", "power_electronics", "motor_control_systems", "solar_panel_array", "electrical_safety_demo"],
      coordinates: [7.254400, 80.592700],
      svg_id: "B34",
      building_capacity: 150
    }
  ];
  }
  
  return buildingsData.find(building => building.building_ID === buildingId);
}

// Helper function to get all buildings
async function getAllBuildings() {
  // Try to fetch real data from API, fallback to static data if API fails
  let buildingsData;
  try {
    const apiData = await fetchBuildingDataFromAPI();
    if (apiData && apiData.length > 0) {
      buildingsData = mergeBuildingData(apiData);
    } else {
      throw new Error('No data from API');
    }
  } catch (error) {
    console.warn('Using fallback static data:', error.message);
    // Fallback to static data
    buildingsData = [
    {
      building_ID: "B1",
      zone_ID: 1,
      building_name: "Engineering Carpentry Shop",
      description: "Engineering carpentry workshop with traditional woodworking tools and modern manufacturing techniques.",
      exhibits: ["asss", "carpentry_tools", "wood_joint_display", "woodworking_station"],
      coordinates: [7.253750, 80.592028],
      svg_id: "B1",
      building_capacity: 85
    },
    {
      building_ID: "B2",
      zone_ID: 1,
      building_name: "Engineering Workshop",
      description: "Main engineering workshop featuring manufacturing processes, automation, and mechanical systems.",
      exhibits: ["metal_fabrication", "kiosk", "cnc_machine", "metal_casting_process", "hydraulic_press_demo", "pneumatic_systems", "laser_cutting_display", "advanced_cnc_machining", "welding_demo"],
      coordinates: [7.253800, 80.592100],
      svg_id: "B2",
      building_capacity: 85
    },
    {
      building_ID: "B6",
      zone_ID: 2,
      building_name: "Structure Lab",
      description: "Civil engineering structural testing laboratory with seismic simulation and materials testing.",
      exhibits: ["soil_mechanics_lab", "bridge_design_model", "load_testing", "structural_model", "concrete_testing_lab", "structural_analysis_model", "seismic_simulation"],
      coordinates: [7.253850, 80.592150],
      svg_id: "B6",
      building_capacity: 60
    },
    {
      building_ID: "B11",
      zone_ID: 3,
      building_name: "Department of Chemical and process Engineering",
      description: "Chemical engineering department showcasing process control, safety systems, and reaction kinetics.",
      exhibits: ["process_safety_system", "reaction_kinetics_lab", "heat_exchanger_model", "distillation_column", "chemical_process", "chemical_reactor", "process_control", "crystallization_demo"],
      coordinates: [7.253900, 80.592200],
      svg_id: "B11",
      building_capacity: 80
    },
    {
      building_ID: "B15",
      zone_ID: 2,
      building_name: "Department of Manufacturing and Industrial Engineering",
      description: "Manufacturing engineering with 3D printing, robotics, and industrial automation systems.",
      exhibits: ["3d_printer", "industrial_robotics", "assembly_line_model", "lean_manufacturing", "additive_manufacturing", "quality_control_station", "ergonomics_workstation"],
      coordinates: [7.253950, 80.592250],
      svg_id: "B15",
      building_capacity: 80
    },
    {
      building_ID: "B17",
      zone_ID: 1,
      building_name: "Electronic Lab",
      description: "Electronics laboratory featuring robotics, IoT systems, and advanced electronic circuits.",
      exhibits: ["microcontroller_projects", "robotics_arm", "circuit_boards", "sensor_network", "robotics_display", "iot_sensor_network", "pcb_design_station", "signal_processing_lab", "wireless_communication"],
      coordinates: [7.254000, 80.592300],
      svg_id: "B17",
      building_capacity: 130
    },
    {
      building_ID: "B20",
      zone_ID: 1,
      building_name: "Department of Computer Engineering",
      description: "Computer engineering department with AI, cybersecurity, and software development showcases.",
      exhibits: ["programming_showcase", "microprocessor_demo", "cybersecurity_lab", "web_development_showcase", "machine_learning_demo", "ai_chatbot", "computer_vision_system", "database_management"],
      coordinates: [7.254050, 80.592350],
      svg_id: "B20",
      building_capacity: 130
    },
    {
      building_ID: "B28",
      zone_ID: 3,
      building_name: "Materials Lab",
      description: "Materials science laboratory with advanced materials testing and characterization equipment.",
      exhibits: ["material_characterization", "nanomaterials_display", "composite_materials", "metal_fatigue_testing", "corrosion_analysis"],
      coordinates: [7.254100, 80.592400],
      svg_id: "B28",
      building_capacity: 140
    },
    {
      building_ID: "B29",
      zone_ID: 3,
      building_name: "Thermodynamics Lab",
      description: "Thermodynamics laboratory featuring heat engines, thermal imaging, and energy systems.",
      exhibits: ["refrigeration_cycle", "gas_turbine_display", "thermal_imaging_demo", "entropy_demonstration", "heat_engine_model"],
      coordinates: [7.254150, 80.592450],
      svg_id: "B29",
      building_capacity: 140
    },
    {
      building_ID: "B30",
      zone_ID: 3,
      building_name: "Fluids Lab",
      description: "Fluid mechanics laboratory with wind tunnel, pump testing, and flow visualization systems.",
      exhibits: ["wind_tunnel_model", "pump_performance_test", "flow_visualization", "hydraulic_systems_demo", "turbulence_study"],
      coordinates: [7.254200, 80.592500],
      svg_id: "B30",
      building_capacity: 140
    },
    {
      building_ID: "B31",
      zone_ID: 2,
      building_name: "Surveying and Soil Lab",
      description: "Surveying and geotechnical laboratory with modern mapping and soil testing equipment.",
      exhibits: ["theodolite_station", "soil_testing_equipment", "topographic_mapping", "drone_mapping_display", "gps_surveying_equipment"],
      coordinates: [7.254250, 80.592550],
      svg_id: "B31",
      building_capacity: 140
    },
    {
      building_ID: "B32",
      zone_ID: 4,
      building_name: "Department of Engineering Mathematics",
      description: "Engineering mathematics department with statistical analysis and numerical methods demonstrations.",
      exhibits: ["differential_equations", "statistics_lab", "numerical_methods", "calculus_visualization", "linear_algebra_models"],
      coordinates: [7.254300, 80.592600],
      svg_id: "B32",
      building_capacity: 100
    },
    {
      building_ID: "B33",
      zone_ID: 4,
      building_name: "Drawing Office 1",
      description: "Technical drawing and CAD laboratory with design optimization and 3D modeling stations.",
      exhibits: ["technical_drawing_board", "geometric_modeling", "design_optimization", "cad_workstations", "3d_modeling_station"],
      coordinates: [7.254350, 80.592650],
      svg_id: "B33",
      building_capacity: 200
    },
    {
      building_ID: "B34",
      zone_ID: 1,
      building_name: "Department of Electrical and Electronic Engineering",
      description: "Electrical and electronic engineering department featuring power systems, renewable energy, and smart grid technology.",
      exhibits: ["transformer_display", "power_systems", "renewable_energy", "smart_grid", "power_electronics", "motor_control_systems", "solar_panel_array", "electrical_safety_demo"],
      coordinates: [7.254400, 80.592700],
      svg_id: "B34",
      building_capacity: 150
    }
  ];
  }
  
  return buildingsData.map(building => ({
    building_ID: building.building_ID,
    building_name: building.building_name,
    description: building.description,
    zone_ID: building.zone_ID,
    exhibits: building.exhibits || [],
    coordinates: building.coordinates,
    svg_id: building.svg_id,
    building_capacity: building.building_capacity
  }));
}

// Helper function to map building ID to SVG ID
function mapDatabaseIdToSvgId(databaseId) {
  const mapping = {
    "B1": "B1",   // Engineering Carpentry Shop
    "B2": "B2",   // Engineering Workshop
    "B6": "B6",   // Structure Lab
    "B11": "B11", // Department of Chemical and process Engineering
    "B15": "B15", // Department of Manufacturing and Industrial Engineering
    "B17": "B17", // Electronic Lab
    "B20": "B20", // Department of Computer Engineering
    "B28": "B28", // Materials Lab
    "B29": "B29", // Thermodynamics Lab
    "B30": "B30", // Fluids Lab
    "B31": "B31", // Surveying and Soil Lab
    "B32": "B32", // Department of Engineering Mathematics
    "B33": "B33", // Drawing Office 1
    "B34": "B34", // Department of Electrical and Electronic Engineering
  };
  return mapping[databaseId] || databaseId;
}

// Synchronous versions for immediate use (using cached data)
let cachedBuildingData = null;

// Initialize cache with API data
async function initializeBuildingCache() {
  try {
    const apiData = await fetchBuildingDataFromAPI();
    if (apiData && apiData.length > 0) {
      cachedBuildingData = mergeBuildingData(apiData);
    }
  } catch (error) {
    console.warn('Failed to initialize building cache:', error.message);
  }
}

// Synchronous search function using cached data
function searchDatabaseSync(query, { category, zone, subzone } = {}) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.trim().toLowerCase();
  let results = [];
  
  // Use cached data or fallback to static data
  const buildingsData = cachedBuildingData || getStaticBuildingData();
  
  // Enhanced search logic with improved matching
  buildingsData.forEach((building) => {
    const matchesQuery = 
      building.building_name?.toLowerCase().includes(searchTerm) ||
      building.description?.toLowerCase().includes(searchTerm) ||
      building.exhibits?.some(exhibit => exhibit.toLowerCase().includes(searchTerm));
    
    if (matchesQuery) {
      // Check zone filter if provided
      if (zone && zone !== 'all') {
        if (building.zone_ID !== parseInt(zone)) return;
      }
      
      // Add building to results
      results.push({
        id: building.building_ID,
        name: building.building_name,
        category: 'Building',
        description: building.description,
        buildingId: building.building_ID,
        buildingName: building.building_name,
        svgBuildingId: building.svg_id,
        zoneId: building.zone_ID,
        coordinates: building.coordinates,
        exhibits: building.exhibits || [],
        type: 'building'
      });
      
      // Add exhibits from this building that match the search
      if (building.exhibits) {
        building.exhibits.forEach((exhibit, index) => {
          if (exhibit.toLowerCase().includes(searchTerm)) {
            results.push({
              id: `${building.building_ID}-exhibit-${index}`,
              name: exhibit,
              category: 'Exhibits',
              description: `Exhibit in ${building.building_name}`,
              buildingId: building.building_ID,
              buildingName: building.building_name,
              svgBuildingId: building.svg_id,
              zoneId: building.zone_ID,
              coordinates: building.coordinates,
              type: 'exhibit'
            });
          }
        });
      }
    }
  });
  
  // Remove duplicates and limit results
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );
  
  return uniqueResults.slice(0, 20); // Limit to 20 results
}

// Get static building data as fallback
function getStaticBuildingData() {
  return [
    {
      building_ID: "B1",
      zone_ID: 1,
      building_name: "Engineering Carpentry Shop",
      description: "Engineering carpentry workshop with traditional woodworking tools and modern manufacturing techniques.",
      exhibits: ["asss", "carpentry_tools", "wood_joint_display", "woodworking_station"],
      coordinates: [7.253750, 80.592028],
      svg_id: "B1",
      building_capacity: 85
    },
    {
      building_ID: "B2",
      zone_ID: 1,
      building_name: "Engineering Workshop",
      description: "Main engineering workshop featuring manufacturing processes, automation, and mechanical systems.",
      exhibits: ["metal_fabrication", "kiosk", "cnc_machine", "metal_casting_process", "hydraulic_press_demo", "pneumatic_systems", "laser_cutting_display", "advanced_cnc_machining", "welding_demo"],
      coordinates: [7.253800, 80.592100],
      svg_id: "B2",
      building_capacity: 85
    },
    // ... rest of the static building data would go here for complete fallback
  ];
}

// Initialize the cache when the module loads
initializeBuildingCache();

export {
  // Async versions (recommended)
  searchDatabase,
  getBuildingById,
  getAllBuildings,
  
  // Sync versions (for immediate use)
  searchDatabaseSync,
  
  // Utilities
  mapDatabaseIdToSvgId,
  initializeBuildingCache,
  fetchBuildingDataFromAPI,
  mergeBuildingData
};

