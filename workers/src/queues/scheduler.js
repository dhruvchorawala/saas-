const { Queue, Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const mongoose = require('mongoose');

// Need to define basic Product schema to query active ones
const ProductSchema = new mongoose.Schema({
  url: String,
  trackingStatus: String,
  user: mongoose.Schema.ObjectId
}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const schedulerQueue = new Queue('scheduler-queue', { connection: redisConnection });
const scrapeQueue = new Queue('scrape-queue', { connection: redisConnection });

// Worker that runs on a schedule
const schedulerWorker = new Worker('scheduler-queue', async (job) => {
  console.log(`[Scheduler] Running scheduled job: ${job.name}`);
  
  try {
    const activeProducts = await Product.find({ trackingStatus: 'ACTIVE' });
    console.log(`[Scheduler] Found ${activeProducts.length} active products to monitor.`);
    
    for (const product of activeProducts) {
      await scrapeQueue.add('SCRAPE_PRODUCT', {
        productId: product._id.toString(),
        url: product.url,
        userId: product.user ? product.user.toString() : null
      }, {
        // lower priority for scheduled monitoring compared to user manual adds
        priority: 5,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
      });
      console.log(`[Scheduler] Queued product ${product._id} for scraping.`);
    }
  } catch (error) {
    console.error(`[Scheduler] Error fetching products:`, error);
  }
}, { connection: redisConnection });

// Add repeatable job to scheduler-queue
const initializeScheduler = async () => {
  // Clear old repeatable jobs to avoid duplicates on restart
  const repeatableJobs = await schedulerQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await schedulerQueue.removeRepeatableByKey(job.key);
  }

  // Add the new repeatable job (every 6 hours)
  await schedulerQueue.add('MONITOR_ALL_PRODUCTS', {}, {
    repeat: { pattern: '0 */6 * * *' }
  });
  console.log('[Scheduler] Initialized monitoring cron (every 6 hours).');
};

module.exports = { schedulerWorker, initializeScheduler };
