/**
 * Migration Script: Import buildings.json data into map_buildings table
 * 
 * Usage: node migrate_buildings_data.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from root .env file
const envPath = path.resolve(__dirname, '../../../../.env');
require('dotenv').config({ path: envPath });

console.log('🔍 Loading .env from:', envPath);
console.log('🔑 DB_PASSWORD loaded:', process.env.DB_PASSWORD ? '***' : 'NOT FOUND');

// Database connection - using same config as db.js
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: 'engx', // Navigation tables are in engx database
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || '1323'), // Fallback to known password
  max: 20, // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function migrateData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migration from buildings.json to map_buildings table...');
    
    // Read buildings.json
    const jsonPath = path.join(__dirname, '../../../../shared/buildings.json');
    const buildingsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📦 Found ${buildingsData.length} buildings in JSON file`);
    
    // Start transaction
    await client.query('BEGIN');
    
    // Clear existing data (optional - comment out if you want to preserve existing data)
    await client.query('TRUNCATE TABLE map_buildings RESTART IDENTITY CASCADE');
    console.log('🗑️ Cleared existing data from map_buildings table');
    
    // Insert each building
    let successCount = 0;
    let errorCount = 0;
    
    for (const building of buildingsData) {
      try {
        await client.query(`
          INSERT INTO map_buildings (
            building_id, building_name, description, svg_id, 
            node_id, zone_id, exhibits, coordinates
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (building_id) DO UPDATE SET
            building_name = EXCLUDED.building_name,
            description = EXCLUDED.description,
            svg_id = EXCLUDED.svg_id,
            node_id = EXCLUDED.node_id,
            zone_id = EXCLUDED.zone_id,
            exhibits = EXCLUDED.exhibits,
            coordinates = EXCLUDED.coordinates,
            updated_at = CURRENT_TIMESTAMP
        `, [
          building.building_ID,
          building.building_name,
          building.description,
          building.svg_id,
          building.node_id,
          building.zone_ID,
          JSON.stringify(building.exhibits || []),
          building.coordinates ? JSON.stringify(building.coordinates) : null
        ]);
        
        successCount++;
        console.log(`✅ Migrated: ${building.building_name} (ID: ${building.building_ID})`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Error migrating building ${building.building_ID}:`, err.message);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${buildingsData.length}`);
    
    // Verify data
    const result = await client.query('SELECT COUNT(*) FROM map_buildings');
    console.log(`\n✅ Verification: ${result.rows[0].count} buildings in database`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Migration failed:', err);
    process.exit(1);
  });
