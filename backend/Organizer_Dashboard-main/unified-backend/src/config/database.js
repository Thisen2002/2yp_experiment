const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'organizer_dashboard',
  password: process.env.DB_PASSWORD || '1323',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = pool;