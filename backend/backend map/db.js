const { Pool } = require('pg');
const path = require('path');

// Load environment variables from root .env file
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

console.log('🔍 Loading .env from:', envPath);
console.log('🔑 DB_PASSWORD loaded:', process.env.DB_PASSWORD ? '***' : 'NOT FOUND');

// PostgreSQL connection pool for Maps backend
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

// Test connection
pool.on('connect', () => {
  console.log('✅ Maps backend connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
