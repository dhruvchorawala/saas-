const User = require('../models/User');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const AlertRule = require('../models/AlertRule');
const Notification = require('../models/Notification');
const refreshQueue = require('../services/refreshQueue');
const { queueStaleProducts } = require('../services/scheduler');

// @desc    Get admin dashboard metrics
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, pricedProducts, failedProducts, userProducts, offersFound, activeAlerts, notifications] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Product.countDocuments({ bestPrice: { $gt: 0 } }),
        Product.countDocuments({ refreshStatus: 'FAILED' }),
        Product.countDocuments({ origin: 'USER' }),
        Offer.countDocuments({ status: 'FOUND' }),
        AlertRule.countDocuments({ isActive: true }),
        Notification.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        pricedProducts,
        failedProducts,
        userProducts,
        offersFound,
        activeAlerts,
        notifications,
        queue: refreshQueue.stats(),
      },
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

// @desc    Refresh jobs (running, waiting and recent)
// @route   GET /api/v1/admin/jobs
// @access  Private/Admin
exports.getJobs = async (req, res, next) => {
  try {
    const jobs = refreshQueue.jobs();
    const products = await Product.find({ _id: { $in: [...new Set(jobs.map(j => j.productId))] } }).select('name');
    const names = new Map(products.map(p => [String(p._id), p.name]));

    res.status(200).json({
      success: true,
      stats: refreshQueue.stats(),
      data: jobs.map(job => ({ ...job, productName: names.get(job.productId) || '(deleted product)' })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Queue a refresh of every product whose prices are stale
// @route   POST /api/v1/admin/refresh-stale
// @access  Private/Admin
exports.refreshStale = async (req, res, next) => {
  try {
    const queued = await queueStaleProducts();
    res.status(202).json({ success: true, data: { queued } });
  } catch (err) {
    next(err);
  }
};

// @desc    Queue a refresh of every product
// @route   POST /api/v1/admin/refresh-all
// @access  Private/Admin
exports.refreshAll = async (req, res, next) => {
  try {
    const products = await Product.find().select('_id').sort('lastCheckedAt');
    let queued = 0;
    for (const p of products) {
      if (refreshQueue.add(p._id, { reason: 'admin refresh-all' })) queued++;
    }
    res.status(202).json({ success: true, data: { queued } });
  } catch (err) {
    next(err);
  }
};
