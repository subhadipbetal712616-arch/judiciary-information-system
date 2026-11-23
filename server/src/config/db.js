/**
 * Database connection module.
 *
 * Connects to MongoDB using one of:
 *  1. MONGODB_URI from .env if provided (production / local install)
 *  2. mongodb-memory-server as a fallback (sandbox-friendly, no install needed)
 *
 * The memory server instance is cached on the global object so that
 * Node's --watch mode doesn't spawn multiple instances on reload.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Cache the in-memory server across HMR / watch reloads.
let memoryServer = null;
let isConnecting = false;

/**
 * Connect to MongoDB, falling back to an in-memory server.
 * @returns {Promise<typeof mongoose>} Mongoose instance (already connected)
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (isConnecting) {
    // Wait for an in-progress connection to finish.
    while (isConnecting) {
      await new Promise((r) => setTimeout(r, 50));
    }
    return mongoose;
  }
  isConnecting = true;

  try {
    let uri = process.env.MONGODB_URI;

    // No URI supplied -> boot an in-memory MongoDB instance.
    if (!uri) {
      console.log('[db] No MONGODB_URI provided — starting mongodb-memory-server…');
      // Use a version that ships binaries for modern Debian/Ubuntu.
      // Default (6.0.14) is unavailable on Debian 12+; 7.0.3+ works everywhere.
      memoryServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
      uri = memoryServer.getUri();
      console.log('[db] In-memory MongoDB started at', uri);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[db] MongoDB connected:', uri);
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    process.exit(1);
  } finally {
    isConnecting = false;
  }
  return mongoose;
}

/**
 * Close the database connection and stop the memory server if running.
 * Used by the seed script to exit cleanly.
 */
async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[db] MongoDB disconnected.');
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
    console.log('[db] In-memory MongoDB stopped.');
  }
}

module.exports = { connectDB, closeDB };
