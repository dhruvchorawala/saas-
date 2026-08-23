const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const ScraperManager = require('../scrapers/ScraperManager');
const browserService = require('../scrapers/BrowserService');

// Mongoose Model connection
// We need to define the schema since workers are separate from backend
const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: String,
  brand: String,
  image: String,
  price: Number,
  mrp: Number,
  discount: String,
  currency: String,
  seller: String,
  variant: String,
  availability: String,
  deliveryCharge: Number,
  estimatedDeliveryDate: String,
  url: String,
  trackingStatus: String
}, { strict: false, timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

console.log('[Worker] Initializing scrapeWorker...');

const scrapeWorker = new Worker('scrape-queue', async (job) => {
  const { productId, url, userId } = job.data;
  console.log(`[Job ${job.id}] Processing scrape for URL: ${url}`);

  try {
    // 1. Execute scrape
    const scrapedData = await ScraperManager.scrape(url);
    
    // 2. Update database with structured data
    console.log(`[Job ${job.id}] Updating DB for Product ID: ${productId}`);
    await Product.findByIdAndUpdate(productId, {
      name: scrapedData.productName,
      brand: scrapedData.brand,
      image: scrapedData.image,
      price: scrapedData.price,
      mrp: scrapedData.mrp,
      discount: scrapedData.discount,
      currency: scrapedData.currency,
      seller: scrapedData.seller,
      availability: scrapedData.availability,
      deliveryCharge: scrapedData.deliveryCharge,
      estimatedDeliveryDate: scrapedData.estimatedDeliveryDate,
    });

    console.log(`[Job ${job.id}] Successfully completed.`);
    return scrapedData;

  } catch (err) {
    console.error(`[Job ${job.id}] Failed: ${err.message}`);
    throw err; // BullMQ will handle retries based on queue configuration
  }
}, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 jobs simultaneously
});

scrapeWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed!`);
});

scrapeWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} has failed with ${err.message}`);
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('[Worker] Shutting down gracefully...');
  await scrapeWorker.close();
  await browserService.close();
  process.exit(0);
});

module.exports = scrapeWorker;
