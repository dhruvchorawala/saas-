const Product = require('../models/Product');
const Offer = require('../models/Offer');
const AlertRule = require('../models/AlertRule');
const Notification = require('../models/Notification');
const Watchlist = require('../models/Watchlist');
const { STORES } = require('../scrapers/stores');

const PRODUCT_CARD_FIELDS = 'name brand category image bestPrice bestStore highestPrice mrp storeCount inStock priceChange priceChangePercentage lastCheckedAt refreshStatus';

// @desc    Personal dashboard: watched products, alerts and savings
// @route   GET /api/v1/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const watchlist = await Watchlist.findOne({ user: userId }).populate('products', PRODUCT_CARD_FIELDS);
    const watched = watchlist ? watchlist.products.filter(Boolean) : [];

    const [activeAlerts, alertsTriggered, unread, recentNotifications] = await Promise.all([
      AlertRule.countDocuments({ user: userId, isActive: true }),
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, read: false }),
      Notification.find({ user: userId }).sort('-createdAt').limit(5).populate('product', 'name image'),
    ]);

    // "Savings" = what you save by buying at the cheapest store instead of the most expensive one
    const compared = watched.filter(p => p.bestPrice && p.highestPrice && p.storeCount > 1);
    const totalSavings = compared.reduce((sum, p) => sum + (p.highestPrice - p.bestPrice), 0);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          watchedProducts: watched.length,
          activeAlerts,
          alertsTriggered,
          unreadNotifications: unread,
          priceDrops: watched.filter(p => p.priceChange < 0).length,
          totalSavings,
        },
        savingsChart: compared
          .map(p => ({
            name: p.name.length > 22 ? `${p.name.slice(0, 20)}…` : p.name,
            bestPrice: p.bestPrice,
            highestPrice: p.highestPrice,
            savings: p.highestPrice - p.bestPrice,
          }))
          .sort((a, b) => b.savings - a.savings)
          .slice(0, 8),
        watched: [...watched].sort((a, b) => (b.lastCheckedAt || 0) - (a.lastCheckedAt || 0)),
        recentNotifications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Market-wide analytics over the whole catalog
// @route   GET /api/v1/analytics/market
// @access  Public
exports.getMarketAnalytics = async (req, res, next) => {
  try {
    const [wins, coverage, categories, gaps, movers] = await Promise.all([
      // How often each store has the cheapest price
      Product.aggregate([
        { $match: { bestStore: { $ne: null }, storeCount: { $gt: 1 } } },
        { $group: { _id: '$bestStore', wins: { $sum: 1 } } },
      ]),
      // How many catalog products each store lists
      Offer.aggregate([
        { $match: { status: 'FOUND' } },
        { $group: { _id: '$storeName', listed: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            products: { $sum: 1 },
            priced: { $sum: { $cond: [{ $gt: ['$bestPrice', null] }, 1, 0] } },
            avgBestPrice: { $avg: '$bestPrice' },
          },
        },
      ]),
      // Biggest difference between the cheapest and dearest store
      Product.aggregate([
        { $match: { storeCount: { $gt: 1 }, bestPrice: { $gt: 0 } } },
        {
          $addFields: {
            gap: { $subtract: ['$highestPrice', '$bestPrice'] },
            gapPercent: { $multiply: [{ $divide: [{ $subtract: ['$highestPrice', '$bestPrice'] }, '$highestPrice'] }, 100] },
          },
        },
        { $match: { gap: { $gt: 0 } } },
        { $sort: { gapPercent: -1 } },
        { $limit: 8 },
        { $project: { name: 1, image: 1, bestPrice: 1, bestStore: 1, highestPrice: 1, gap: 1, gapPercent: 1 } },
      ]),
      Product.find({ priceChange: { $ne: 0, $exists: true } })
        .sort('-lastCheckedAt')
        .limit(8)
        .select('name image bestPrice bestStore priceChange priceChangePercentage lastCheckedAt'),
    ]);

    const totalCompared = wins.reduce((sum, w) => sum + w.wins, 0);
    res.status(200).json({
      success: true,
      data: {
        stores: STORES.map(store => {
          const w = wins.find(x => x._id === store.name);
          const c = coverage.find(x => x._id === store.name);
          return {
            name: store.name,
            wins: w ? w.wins : 0,
            winRate: totalCompared && w ? Math.round((w.wins / totalCompared) * 100) : 0,
            listed: c ? c.listed : 0,
          };
        }),
        categories: Product.CATEGORIES.map(name => {
          const c = categories.find(x => x._id === name);
          return {
            name,
            products: c ? c.products : 0,
            priced: c ? c.priced : 0,
            avgBestPrice: c && c.avgBestPrice ? Math.round(c.avgBestPrice) : null,
          };
        }),
        biggestGaps: gaps.map(g => ({ ...g, gapPercent: Math.round(g.gapPercent) })),
        recentMovers: movers,
        totalCompared,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Headline numbers and top deals for the landing page
// @route   GET /api/v1/analytics/stats
// @access  Public
exports.getPublicStats = async (req, res, next) => {
  try {
    const [products, priced, offers, brands, lastChecked, deals] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ bestPrice: { $gt: 0 } }),
      Offer.countDocuments({ status: 'FOUND' }),
      Product.distinct('brand'),
      Product.findOne({ lastCheckedAt: { $ne: null } }).sort('-lastCheckedAt').select('lastCheckedAt'),
      Product.aggregate([
        { $match: { storeCount: { $gt: 1 }, bestPrice: { $gt: 0 }, inStock: true } },
        { $addFields: { savings: { $subtract: ['$highestPrice', '$bestPrice'] } } },
        { $match: { savings: { $gt: 0 } } },
        { $sort: { savings: -1 } },
        { $limit: 6 },
        { $project: { key: 0, __v: 0 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        priced,
        offers,
        brands: brands.filter(Boolean).length,
        stores: STORES.map(s => s.name),
        lastUpdated: lastChecked ? lastChecked.lastCheckedAt : null,
        topDeals: deals,
      },
    });
  } catch (err) {
    next(err);
  }
};
