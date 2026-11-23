/**
 * Seed entry point — `npm run seed` from the server folder runs this.
 * Connects to the DB, wipes + inserts sample data, then disconnects.
 */
require('dotenv').config();

const { connectDB, closeDB } = require('./src/config/db');
const { seedDatabase } = require('./src/utils/seed');

console.log('🌱 Starting database seed…');

(async () => {
  await connectDB();
  await seedDatabase();
  await closeDB();
  process.exit(0);
})().catch((err) => {
  console.error('❌ Seed failed:', err);
  closeDB().finally(() => process.exit(1));
});
