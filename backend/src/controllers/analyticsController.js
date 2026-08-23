const Product = require('../models/Product');
const AlertRule = require('../models/AlertRule');

// @desc    Get dashboard analytics
// @route   GET /api/v1/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Total products tracked
    const totalProducts = await Product.countDocuments({ user: userId });

    // 2. Active alerts
    const activeAlerts = await AlertRule.countDocuments({ user: userId, isActive: true });

    // 3. Price drops & savings
    // We sum the priceChange of all products where priceChange is negative
    const products = await Product.find({ user: userId }).select('priceChange availability updatedAt');
    
    let totalSavings = 0;
    let totalPriceDrops = 0;
    let productsBackInStock = 0;

    products.forEach(p => {
      if (p.priceChange < 0) {
        totalPriceDrops++;
        totalSavings += Math.abs(p.priceChange);
      }
      if (p.availability === 'IN_STOCK') {
        productsBackInStock++; // Simplified back-in-stock metric for now
      }
    });

    // 4. Recent changes (last 5 updated products)
    const recentChanges = await Product.find({ user: userId })
      .sort('-updatedAt')
      .limit(5)
      .select('name image currentPrice priceChange availability trackingStatus updatedAt');

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProducts,
          activeAlerts,
          totalPriceDrops,
          totalSavings,
          productsBackInStock
        },
        recentChanges
      }
    });
  } catch (err) {
    next(err);
  }
};
