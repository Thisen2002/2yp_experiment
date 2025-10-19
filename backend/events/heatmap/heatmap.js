const express = require("express");
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');
// const pool = require('../heatmap_db'); // pg Pool instance
const pool = require("../db");

const router = express.Router();

// URL of the API that gives building data
//this is for local testing with sample_buildings.js
//add correct API URL when deploying
const CCTV_API_URL = process.env.CCTV_API_URL || process.env.VITE_KIOSK_NOTIFICATION_API_URL || "http://localhost:3000/api/buildings";

// Define API base URL for QR API
const API_BASE_URL = "https://ulckzxbsufwjlsyxxzoz.supabase.co/rest/v1";

// Define headers for QR API
const headers = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsY2t6eGJzdWZ3amxzeXh4em96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTAwODcsImV4cCI6MjA3MzU4NjA4N30.J8MMNsdLQh6dw7QC1pFtWIZsYV5e2S2iRfWD_vWMsPM",
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsY2t6eGJzdWZ3amxzeXh4em96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTgwMTAwODcsImV4cCI6MjA3MzU4NjA4N30.J8MMNsdLQh6dw7QC1pFtWIZsYV5e2S2iRfWD_vWMsPM"
};

// ======================== SUPABASE SYNC CONFIGURATION ========================
// TODO: Replace with your new Supabase project details
const SUPABASE_URL = process.env.SUPABASE_SYNC_URL || "https://xyzvldihejbjhtgzdekb.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_SYNC_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enZsZGloZWpiamh0Z3pkZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDIzNjgsImV4cCI6MjA3NjI3ODM2OH0.yZaDszvlrBfS5Moeod9pEdtJuKK2hzYE7EGjOqlgOdY";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SYNC_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enZsZGloZWpiamh0Z3pkZWtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwMjM2OCwiZXhwIjoyMDc2Mjc4MzY4fQ.Oj18xvCQAOdm6MH4z2gckG6q7hIbs1rGCRmniiW6r3o";

// Create Supabase client for sync operations (use service key for full access)
const supabaseSync = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Flag to prevent infinite sync loops
let isLocalUpdate = false;



//module.exports = getMapID;

// Function to calculate heatmap color
function getHeatmapColor(current, capacity) {
  if (capacity <= 0) return "#cccccc"; // gray for invalid capacity
  const ratio = current / capacity;

  if (ratio < 0.2) return "#22c55e"; // green
  if (ratio < 0.5) return "#ffbf00ff"; // light green
  if (ratio < 0.8) return "#f97816ff"; // yellow
  //if (ratio < 0.9) return "#ff0808ff"; // orange
  return "#ff0000ff"; // red
}
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      if(key=="Build_Name") result["building_name"] = obj[key];
      if(key=="building_id") result["building_id"] = obj[key];
      if(key=="total_count") result["current_crowd"] = obj[key];
      
      //result[key] = obj[key];
    }
    return result;
  }, {});
}
async function fetchCapacities() {
  const capacityResult = await pool.query("SELECT building_id, building_capacity FROM buildings");
  const capacityMap = {};
  for (let row of capacityResult.rows) {
    capacityMap[row.building_id] = row.building_capacity;
  }
  return capacityMap;
}

// ======================== SUPABASE SYNC FUNCTIONS ========================

// Check if local database is empty/newly created
async function isLocalDatabaseEmpty() {
  try {
    const buildingsResult = await pool.query("SELECT COUNT(*) as count FROM buildings");
    const statusResult = await pool.query("SELECT COUNT(*) as count FROM current_status");
    
    const buildingsCount = parseInt(buildingsResult.rows[0].count);
    const statusCount = parseInt(statusResult.rows[0].count);
    
    console.log(`📊 Local DB status - Buildings: ${buildingsCount}, Current Status: ${statusCount}`);
    
    // Consider empty if either table is empty or both have very few records
    return buildingsCount === 0 || statusCount === 0 || (buildingsCount < 5 && statusCount < 5);
  } catch (error) {
    console.error("❌ Error checking local database status:", error);
    return true; // Assume empty if we can't check
  }
}

// Restore data from Supabase to local database
async function restoreFromSupabase() {
  try {
    console.log("🔄 Restoring data from Supabase to local database...");
    
    if (SUPABASE_URL.includes("your-new-project") || SUPABASE_SERVICE_KEY.includes("your-new-service")) {
      console.log("⚠️ Supabase credentials not configured. Skipping restore.");
      return false;
    }

    // Get all data from Supabase
    const { data: supabaseBuildings, error } = await supabaseSync
      .from('buildings')
      .select('*');

    if (error) {
      console.error("❌ Error fetching from Supabase:", error);
      return false;
    }

    if (!supabaseBuildings || supabaseBuildings.length === 0) {
      console.log("ℹ️ No data found in Supabase to restore");
      return false;
    }

    isLocalUpdate = true; // Prevent triggering sync back to Supabase

    console.log(`📦 Restoring ${supabaseBuildings.length} buildings from Supabase...`);

    // Restore buildings and current_status
    for (const building of supabaseBuildings) {
      // Insert/update building
      await pool.query(`
        INSERT INTO buildings (building_id, building_name, building_capacity)
        VALUES ($1, $2, $3)
        ON CONFLICT (building_id)
        DO UPDATE SET 
          building_name = EXCLUDED.building_name,
          building_capacity = EXCLUDED.building_capacity
      `, [building.building_id, building.building_name, building.building_capacity]);

      // Insert/update current_status
      await pool.query(`
        INSERT INTO current_status (building_id, current_crowd, color, status_timestamp)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (building_id)
        DO UPDATE SET 
          current_crowd = EXCLUDED.current_crowd,
          color = EXCLUDED.color,
          status_timestamp = EXCLUDED.status_timestamp
      `, [
        building.building_id,
        building.current_count || 0,
        building.color || '#cccccc',
        building.last_updated || new Date().toISOString()
      ]);
    }

    isLocalUpdate = false;
    console.log(`✅ Successfully restored ${supabaseBuildings.length} buildings from Supabase`);
    return true;

  } catch (error) {
    isLocalUpdate = false;
    console.error("❌ Error restoring from Supabase:", error);
    return false;
  }
}

// Sync local changes to Supabase
async function syncToSupabase(buildingData) {
  if (isLocalUpdate) return; // Skip if this is a restore operation
  
  try {
    if (SUPABASE_URL.includes("your-new-project") || SUPABASE_SERVICE_KEY.includes("your-new-service")) {
      return; // Skip if not configured
    }

    const { error } = await supabaseSync
      .from('buildings')
      .upsert({
        building_id: buildingData.building_id,
        building_name: buildingData.building_name,
        building_capacity: buildingData.building_capacity,
        current_count: buildingData.current_crowd || 0,
        color: buildingData.color || '#cccccc',
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'building_id'
      });

    if (error) {
      console.error(`❌ Error syncing building ${buildingData.building_id} to Supabase:`, error);
    } else {
      console.log(`✅ Synced building ${buildingData.building_id} to Supabase`);
    }
  } catch (error) {
    console.error("❌ Error in syncToSupabase:", error);
  }
}

// Initialize sync system - check if restore is needed
async function initializeSync() {
  try {
    const isEmpty = await isLocalDatabaseEmpty();
    
    if (isEmpty) {
      console.log("🔄 Local database appears to be empty or newly created. Attempting to restore from Supabase...");
      const restored = await restoreFromSupabase();
      
      if (restored) {
        console.log("✅ Data restoration from Supabase completed successfully");
      } else {
        console.log("ℹ️ No data restored from Supabase - will proceed with normal operation");
      }
    } else {
      console.log("ℹ️ Local database has data - sync system ready for bidirectional updates");
    }
  } catch (error) {
    console.error("❌ Error initializing sync system:", error);
  }
}

// Route to serve map data with caching
router.get("/map-data", async (req, res) => {
  try {
    // Initialize sync system on first request
    await initializeSync();
    
    // 1️ Check if cached data is recent (less than 1 minutes)
    const dbResult = await pool.query("SELECT b.building_id,b.building_name,cs.current_crowd,b.building_capacity,cs.color,cs.status_timestamp FROM buildings b JOIN current_status cs ON b.building_id = cs.building_id");
    const now = new Date();
    const capacityMap = await fetchCapacities();

    let useCache = true;

    if (dbResult.rows.length > 0) {
      // check if any row is older than 1 minutes
      console.log("--------------------------------------");
      for (let row of dbResult.rows) {
        const diff = (now - new Date(row.status_timestamp)) / 1000 / 60; // diff in minutes
        console.log(`Building ${row.building_id} data age: ${diff.toFixed(2)} minutes`);
        if (diff > 0.002) {
          useCache = false;
          console.log(`Cache expired for building_id ${row.building_id}, fetching fresh data.`);
          break;
        }
      }
    } else {
      useCache = false; // no data in DB
    }

    if (useCache) {
      // Return cached data from DB
      return res.json({
        success: true,
        source: "Database Cache",
        data: dbResult.rows
      });
    }

    // 2️ Otherwise fetch from API with fallback handling
    console.log("Fetching fresh data from Buildings API...");
    
    let buildings = [];
    let dataSource = "Unknown";
    let apiSuccess = false;

    // Try to fetch from QR API first
    try {
      console.log("🔄 Attempting to fetch from QR API...");
      //for testing use this fetch.this takes response from sample_buildings.js not real QR API
      //const response = await axios.get(CCTV_API_URL);

      //This gets response from real QR API
      const response = await axios.get(`${API_BASE_URL}/BUILDING`, { headers });
      
      buildings = response.data.data || response.data;
      dataSource = "Buildings QR API";
      apiSuccess = true;
      console.log(`✅ Successfully fetched ${buildings.length} buildings from QR API`);
      
    } catch (apiError) {
      console.error("❌ QR API failed:", apiError.response?.status, apiError.response?.statusText || apiError.message);
      
      // Fallback 1: Try to get data from Supabase if QR API fails
      if (!SUPABASE_URL.includes("your-new-project")) {
        try {
          console.log("🔄 QR API failed, attempting to fetch from Supabase...");
          const { data: supabaseBuildings, error } = await supabaseSync
            .from('buildings')
            .select('building_id, building_name as Build_Name, current_count as total_count, building_capacity')
            .order('last_updated', { ascending: false });

          if (!error && supabaseBuildings && supabaseBuildings.length > 0) {
            buildings = supabaseBuildings;
            dataSource = "Supabase Fallback";
            console.log(`✅ Fallback: Retrieved ${buildings.length} buildings from Supabase`);
          } else {
            throw new Error("Supabase fallback failed: " + (error?.message || "No data"));
          }
        } catch (supabaseError) {
          console.error("❌ Supabase fallback failed:", supabaseError.message);
          
          // Fallback 2: Return cached data even if it's old
          if (dbResult.rows.length > 0) {
            console.log("⚠️ Using old cached data as final fallback");
            return res.json({
              success: true,
              source: "Cached Data (Fallback)",
              warning: "QR API and Supabase unavailable - using cached data",
              data: dbResult.rows,
              lastUpdate: dbResult.rows[0]?.status_timestamp
            });
          } else {
            throw new Error("All data sources failed and no cache available");
          }
        }
      } else {
        // Supabase not configured, try cached data
        if (dbResult.rows.length > 0) {
          console.log("⚠️ Supabase not configured, using cached data");
          return res.json({
            success: true,
            source: "Cached Data (No Supabase)",
            warning: "QR API failed and Supabase not configured - using cached data",
            data: dbResult.rows,
            lastUpdate: dbResult.rows[0]?.status_timestamp
          });
        } else {
          throw new Error("QR API failed, Supabase not configured, and no cache available");
        }
      }
    }

    // Process the buildings data (regardless of source)
    const coloredBuildings = [];

    for (let building of buildings) {
      const color = getHeatmapColor(building.total_count, capacityMap[building.building_id] );
      const timestamp = new Date().toLocaleString();

      const buildingData = { 
        ...pick(building, ["building_id","Build_Name", "total_count"]),
        building_capacity: capacityMap[building.building_id], 
        color, 
        status_timestamp: timestamp 
      };
      
      coloredBuildings.push(buildingData);

      //console.log(building.total_count,building.building_id);
      
      // Update local database only if we got fresh data from QR API
      if (apiSuccess) {
        await pool.query(
          `INSERT INTO current_status (building_id, current_crowd, color, status_timestamp)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (building_id)
           DO UPDATE SET current_crowd = EXCLUDED.current_crowd,
                         color = EXCLUDED.color,
                         status_timestamp = EXCLUDED.status_timestamp`,
          [building.building_id, building.total_count, color, timestamp]
        );

        // Sync to Supabase only if we got fresh data from QR API
        await syncToSupabase({
          building_id: building.building_id,
          building_name: buildingData.building_name,
          building_capacity: buildingData.building_capacity,
          current_crowd: building.total_count,
          color: color
        });
      }
    }

    res.json({
      success: true,
      source: dataSource,
      data: coloredBuildings,
      ...(dataSource !== "Buildings QR API" && { 
        warning: "Primary API unavailable - using fallback data",
        fallback: true 
      })
    });

  } catch (error) {
    console.error("❌ Critical error in /map-data route:", error.message);
    
    // Final fallback: try to return any available cached data
    try {
      const fallbackResult = await pool.query(`
        SELECT b.building_id, b.building_name, cs.current_crowd, b.building_capacity, 
               cs.color, cs.status_timestamp 
        FROM buildings b 
        LEFT JOIN current_status cs ON b.building_id = cs.building_id
      `);
      
      if (fallbackResult.rows.length > 0) {
        console.log("🆘 Returning emergency cached data");
        return res.json({
          success: true,
          source: "Emergency Cache",
          warning: "All primary data sources failed - returning cached data",
          error: error.message,
          data: fallbackResult.rows
        });
      }
    } catch (cacheError) {
      console.error("❌ Even cache fallback failed:", cacheError.message);
    }

    // If everything fails
    res.status(500).json({
      success: false,
      error: "All data sources unavailable",
      details: error.message,
      suggestions: [
        "Check QR API credentials and network connectivity",
        "Verify Supabase configuration",
        "Ensure local database is accessible",
        "Check server logs for more details"
      ]
    });
  }
});

// ======================== SYNC MANAGEMENT ROUTES ========================

// Route to test QR API connection
router.get("/test-qr-api", async (req, res) => {
  try {
    console.log("🧪 Testing QR API connection...");
    
    const response = await axios.get(`${API_BASE_URL}/BUILDING`, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    const buildings = response.data.data || response.data;
    
    res.json({
      success: true,
      message: "QR API connection successful",
      status: response.status,
      buildingsCount: buildings?.length || 0,
      sampleData: buildings?.slice(0, 2), // Show first 2 buildings
      apiUrl: `${API_BASE_URL}/BUILDING`
    });
    
  } catch (error) {
    console.error("❌ QR API test failed:", error.response?.status, error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: "QR API connection failed",
      status: error.response?.status,
      statusText: error.response?.statusText,
      details: error.response?.data || error.message,
      apiUrl: `${API_BASE_URL}/BUILDING`,
      suggestions: [
        "Check if the API key has expired",
        "Verify the API URL is correct",
        "Ensure network connectivity",
        "Contact API provider for new credentials"
      ]
    });
  }
});

// Route to manually restore from Supabase (for when local DB is recreated)
router.post("/restore-from-supabase", async (req, res) => {
  try {
    console.log("🔄 Manual restore from Supabase requested...");
    
    const restored = await restoreFromSupabase();
    
    if (restored) {
      res.json({
        success: true,
        message: "Data successfully restored from Supabase",
        source: "Supabase Restore"
      });
    } else {
      res.json({
        success: false,
        message: "No data found in Supabase to restore or restore failed",
        source: "Supabase Restore"
      });
    }
  } catch (error) {
    console.error("❌ Error in manual restore:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to restore from Supabase"
    });
  }
});

// Route to manually sync local data to Supabase
router.post("/sync-to-supabase", async (req, res) => {
  try {
    console.log("🔄 Manual sync to Supabase requested...");
    
    // Get all local data
    const localResult = await pool.query(`
      SELECT 
        b.building_id,
        b.building_name,
        b.building_capacity,
        COALESCE(cs.current_crowd, 0) as current_crowd,
        COALESCE(cs.color, '#cccccc') as color,
        COALESCE(cs.status_timestamp, NOW()) as status_timestamp
      FROM buildings b
      LEFT JOIN current_status cs ON b.building_id = cs.building_id
    `);

    if (localResult.rows.length === 0) {
      return res.json({
        success: false,
        message: "No local data found to sync",
        count: 0
      });
    }

    let syncedCount = 0;
    for (const building of localResult.rows) {
      await syncToSupabase(building);
      syncedCount++;
    }

    res.json({
      success: true,
      message: `Successfully synced ${syncedCount} buildings to Supabase`,
      count: syncedCount,
      source: "Manual Sync"
    });

  } catch (error) {
    console.error("❌ Error in manual sync to Supabase:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to sync to Supabase"
    });
  }
});

// Route to check sync status and database health
router.get("/sync-status", async (req, res) => {
  try {
    const isEmpty = await isLocalDatabaseEmpty();
    
    // Check local data count
    const localBuildingsResult = await pool.query("SELECT COUNT(*) as count FROM buildings");
    const localStatusResult = await pool.query("SELECT COUNT(*) as count FROM current_status");
    
    const localBuildingsCount = parseInt(localBuildingsResult.rows[0].count);
    const localStatusCount = parseInt(localStatusResult.rows[0].count);

    // Try to check Supabase data count (if configured)
    let supabaseCount = 0;
    let supabaseError = null;
    
    if (!SUPABASE_URL.includes("your-new-project") && !SUPABASE_SERVICE_KEY.includes("your-new-service")) {
      try {
        const { count, error } = await supabaseSync
          .from('buildings')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          supabaseError = error.message;
        } else {
          supabaseCount = count || 0;
        }
      } catch (err) {
        supabaseError = err.message;
      }
    } else {
      supabaseError = "Supabase not configured";
    }

    res.json({
      success: true,
      local: {
        isEmpty: isEmpty,
        buildings: localBuildingsCount,
        currentStatus: localStatusCount
      },
      supabase: {
        configured: !SUPABASE_URL.includes("your-new-project"),
        buildings: supabaseCount,
        error: supabaseError
      },
      recommendations: isEmpty ? ["Local database appears empty", "Consider running /restore-from-supabase"] : ["Database has data", "Sync system is ready"]
    });

  } catch (error) {
    console.error("❌ Error checking sync status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to check sync status"
    });
  }
});

// ======================== SUPABASE CONNECTION TEST ========================

// Route to test Supabase connection
router.get("/test-supabase", async (req, res) => {
  try {
    console.log("🧪 Testing Supabase connection...");
    
    // Test basic connection
    const startTime = Date.now();
    
    // Try to select from buildings table
    const { data, error, count } = await supabaseSync
      .from('buildings')
      .select('building_id, building_name', { count: 'exact' })
      .limit(5);

    const responseTime = Date.now() - startTime;

    if (error) {
      throw error;
    }

    // Test write permission by trying to upsert a test record (then delete it)
    const testId = 'TEST_CONNECTION_' + Date.now();
    const { error: insertError } = await supabaseSync
      .from('buildings')
      .upsert({
        building_id: testId,
        building_name: 'Connection Test',
        building_capacity: 1,
        current_count: 0,
        color: '#cccccc'
      });

    // Clean up test record
    if (!insertError) {
      await supabaseSync
        .from('buildings')
        .delete()
        .eq('building_id', testId);
    }

    res.json({
      success: true,
      message: "✅ Supabase connection successful",
      connection: {
        url: SUPABASE_URL,
        responseTime: `${responseTime}ms`,
        authenticated: true
      },
      database: {
        totalBuildings: count || 0,
        canRead: true,
        canWrite: !insertError,
        sampleData: data?.slice(0, 3)
      },
      permissions: {
        read: "✅ Working",
        write: insertError ? "❌ Failed: " + insertError.message : "✅ Working"
      }
    });

  } catch (error) {
    console.error("❌ Supabase connection test failed:", error);
    
    res.status(500).json({
      success: false,
      message: "❌ Supabase connection failed",
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      },
      connection: {
        url: SUPABASE_URL,
        configured: !SUPABASE_URL.includes("your-new-project")
      },
      troubleshooting: [
        "Check if SUPABASE_URL is correct",
        "Verify SUPABASE_SERVICE_KEY is valid and not expired", 
        "Ensure 'buildings' table exists in your Supabase project",
        "Check Row Level Security (RLS) policies if enabled",
        "Verify network connectivity to Supabase"
      ]
    });
  }
});

module.exports = router;

