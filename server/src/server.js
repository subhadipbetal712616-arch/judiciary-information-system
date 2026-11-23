/**
 * Express app entry point.
 *
 * Loads env vars, connects to MongoDB, mounts all routes, and
 * wires the central error handler.
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, closeDB } = require('./config/db');
const { seedIfEmpty } = require('./utils/seed');
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const hearingRoutes = require('./routes/hearingRoutes');
const judgmentRoutes = require('./routes/judgmentRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Body parser + CORS.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Health check (no auth) — handy for sanity checks.
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Route mounts.
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/judgments', judgmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 fallback for unknown /api routes.
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler — must be last.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Boot the server. We connect to the database first so that the
 * first request doesn't race with the connection.
 */
async function start() {
  await connectDB();
  // Auto-seed demo data if the DB is empty (e.g. a fresh in-memory instance).
  // This makes `npm run dev` immediately usable with the seeded logins.
  try {
    await seedIfEmpty();
  } catch (err) {
    console.warn('[seed] Auto-seed skipped:', err.message);
  }
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });

  // Graceful shutdown — close the DB connection on SIGINT / SIGTERM.
  const shutdown = async (sig) => {
    console.log(`\n${sig} received — shutting down…`);
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Only auto-start when executed directly (not when required by seed.js).
if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { app, start };
