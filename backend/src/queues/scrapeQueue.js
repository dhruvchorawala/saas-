const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

// Create the scrape queue
const scrapeQueue = new Queue('scrape-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry mechanism
    backoff: {
      type: 'exponential',
      delay: 5000, // Exponential backoff starting at 5s
    },
    removeOnComplete: true, // Keep memory clean
    removeOnFail: false, // Keep failed jobs for inspection/dead-letter
  },
});

module.exports = scrapeQueue;
