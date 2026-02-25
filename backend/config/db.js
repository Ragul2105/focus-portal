const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log(`[DB] Connected to PostgreSQL — ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`);
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

/**
 * Run a parameterised query.
 * @param {string} text
 * @param {any[]}  [params]
 */
const query = (text, params) => pool.query(text, params);

/**
 * Begin a transaction and return a client.
 * Caller must call client.query('COMMIT'|'ROLLBACK') then client.release().
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
