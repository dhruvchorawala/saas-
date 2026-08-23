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

const { PriceIntelligenceService } = require('../intelligence/priceService');

const scrapeWorker = new Worker('scrape-queue', async (job) => {
  const { productId, url, userId } = job.data;
  console.log(`[Job ${job.id}] Processing scrape for URL: ${url}`);

  try {
    // 1. Execute scrape
    const scrapedData = await ScraperManager.scrape(url);
    
    // 2. Load product
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found in DB');

    // 3. Process Intelligence (Snapshot + Aggregates)
    const { updateFields } = await PriceIntelligenceService.processSnapshot(product, scrapedData);
    
    // 4. Update database with structured data and intelligence
    console.log(`[Job ${job.id}] Updating DB for Product ID: ${productId}`);
    await Product.findByIdAndUpdate(productId, {
      name: scrapedData.productName,
      brand: scrapedData.brand,
      image: scrapedData.image,
      price: scrapedData.price, // Raw current price
      mrp: scrapedData.mrp,
      discount: scrapedData.discount,
      currency: scrapedData.currency,
      seller: scrapedData.seller,
      availability: scrapedData.availability,
      deliveryCharge: scrapedData.deliveryCharge,
      estimatedDeliveryDate: scrapedData.estimatedDeliveryDate,
      ...updateFields // Inject calculated history aggregates
    });

    // 5. Detect changes and trigger alerts
    const ChangeDetector = require('../notifications/ChangeDetector');
    const AlertRuleEngine = require('../notifications/AlertRuleEngine');
    
    // We pass the old product state and the new scraped data
    const changes = ChangeDetector.detectChanges(product, scrapedData);
    
    // Evaluate rules and enqueue notifications if necessary
    // We pass the new updated product state
    const newProductState = { price: updateFields.currentPrice || scrapedData.price };
    await AlertRuleEngine.evaluateAndTrigger(productId, changes, newProductState);

    console.log(`[Job ${job.id}] Successfully completed.`);
    return scrapedData;

  } catch (err) {
    console.error(`[Job ${job.id}] Failed: ${err.message}`);
    throw err; // BullMQ will handle retries based on queue configuration
  }
}, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 jobs simultaneously
  removeOnComplete: { count: 1000 }, // Prevent Redis memory leak
  removeOnFail: { count: 2000 }
});

scrapeWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed!`);
});

scrapeWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} has failed with ${err.message}`);
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('[Worker] Shutting down gracefully...');
  await scrapeWorker.close();
  await browserService.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = scrapeWorker;
