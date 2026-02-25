const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');

const routes       = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');
const { pool }     = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Security & Logging ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`[server] Running on http://localhost:${PORT}  (${process.env.NODE_ENV || 'development'})`);
  try {
    const result = await pool.query('SELECT NOW() AS now');
    console.log(`[DB] Connected — server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
  }
});

module.exports = app; // for testing
