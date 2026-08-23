require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Initialize the worker service
require('./queues/scrapeWorker');

console.log('Worker daemon is running and listening to scrape-queue...');
