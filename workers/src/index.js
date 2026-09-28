require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Initialize the worker service
require('./queues/scrapeWorker');

// Initialize the scheduler service for continuous monitoring
const { initializeScheduler } = require('./queues/scheduler');
initializeScheduler();

console.log('Worker daemon is running and listening to scrape-queue...');
