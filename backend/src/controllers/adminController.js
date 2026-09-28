const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const User = require('../models/User');
const Product = require('../models/Product');
const AlertRule = require('../models/AlertRule');
const NotificationHistory = require('../models/NotificationHistory');

// Initialize Redis connection for Queue Introspection
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_HOST?.includes('upstash.io') ? {} : undefined,
});

const scrapeQueue = new Queue('scrape-queue', { connection });
const notificationQueue = new Queue('notification-queue', { connection });

// @desc    Get admin dashboard metrics
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ role: 'USER' }); // Simplified active metric
    const totalProducts = await Product.countDocuments();
    const activeAlerts = await AlertRule.countDocuments({ isActive: true });
    
    // Attempt to get BullMQ stats
    let jobCounts = { waiting: 0, active: 0, completed: 0, failed: 0 };
    try {
      jobCounts = await scrapeQueue.getJobCounts('waiting', 'active', 'completed', 'failed');
    } catch (err) {
      console.error('Failed to get job counts from Redis', err.message);
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalProducts,
        activeAlerts,
        scrapingJobs: jobCounts.waiting + jobCounts.active + jobCounts.completed + jobCounts.failed,
        successfulJobs: jobCounts.completed,
        failedJobs: jobCounts.failed,
        activeJobs: jobCounts.active,
        waitingJobs: jobCounts.waiting
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system jobs
// @route   GET /api/v1/admin/jobs
// @access  Private/Admin
exports.getJobs = async (req, res, next) => {
  try {
    // Determine which states to pull (active, waiting, failed, completed)
    const type = req.query.type || 'active,waiting,failed';
    const typesArray = type.split(',');
    
    let jobs = [];
    try {
      // Pull latest jobs from queue
      jobs = await scrapeQueue.getJobs(typesArray, 0, 50, true);
    } catch (err) {
      console.error('Failed to fetch jobs from Redis', err.message);
    }

    const formattedJobs = jobs.map(j => ({
      id: j.id,
      name: j.name,
      productId: j.data.productId,
      url: j.data.url,
      source: j.data.sourceId,
      status: j.finishedOn ? (j.failedReason ? 'FAILED' : 'COMPLETED') : (j.processedOn ? 'ACTIVE' : 'WAITING'),
      attempts: j.attemptsMade,
      createdAt: j.timestamp,
      startedAt: j.processedOn,
      completedAt: j.finishedOn,
      failedReason: j.failedReason
    }));

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      data: formattedJobs
    });
  } catch (err) {
    next(err);
  }
};
