/**
 * Add the curated brand catalog to MongoDB (idempotent).
 * Prices are fetched by the running server's scheduler, not by this script.
 *
 *   npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { seedCatalog } = require('../seed');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/price_compare');
  const inserted = await seedCatalog();
  console.log(`Catalog seeded: ${inserted} new product(s) added.`);
  await mongoose.disconnect();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
