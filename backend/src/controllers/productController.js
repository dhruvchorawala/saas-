const mongoose = require('mongoose');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const PriceHistory = require('../models/PriceHistory');
const AlertRule = require('../models/AlertRule');
const Notification = require('../models/Notification');
const Watchlist = require('../models/Watchlist');
const refreshQueue = require('../services/refreshQueue');
const { discover } = require('../services/discoveryService');
const { STORES } = require('../scrapers/stores');

const MIN_MANUAL_REFRESH_MS = 10 * 60 * 1000;

const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  relevance: { hasPrice: -1, storeCount: -1, origin: 1, name: 1 },
  price_asc: { hasPrice: -1, bestPrice: 1 },
  price_desc: { hasPrice: -1, bestPrice: -1 },
  savings: { hasPrice: -1, savings: -1 },
  newest: { createdAt: -1 },
  name: { name: 1 },
};

function buildFilter(query) {
  const filter = {};
  if (query.category && Product.CATEGORIES.includes(query.category)) filter.category = query.category;
  if (query.brand) filter.brand = new RegExp(`^${escapeRegex(String(query.brand))}$`, 'i');
  if (query.search) {
    // Every word must appear in the name or brand, in any order
    const words = String(query.search).trim().split(/\s+/).slice(0, 8);
    filter.$and = words.map(word => {
      const re = new RegExp(escapeRegex(word), 'i');
      return { $or: [{ name: re }, { brand: re }] };
    });
  }
  if (query.inStock === 'true') filter.inStock = true;
  return filter;
}

// @desc    Browse the catalog (search, filter, sort, paginate)
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 48);
    const sort = SORTS[req.query.sort] || SORTS.relevance;

    const [result] = await Product.aggregate([
      { $match: buildFilter(req.query) },
      {
        $addFields: {
          hasPrice: { $cond: [{ $gt: ['$bestPrice', null] }, 1, 0] },
          savings: { $subtract: [{ $ifNull: ['$highestPrice', 0] }, { $ifNull: ['$bestPrice', 0] }] },
        },
      },
      { $sort: { ...sort, _id: 1 } },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $project: { key: 0, __v: 0 } }],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const total = result.total[0] ? result.total[0].count : 0;
    res.status(200).json({
      success: true,
      count: result.data.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Categories and brands with product counts (for filters)
// @route   GET /api/v1/products/facets
// @access  Public
exports.getFacets = async (req, res, next) => {
  try {
    const match = req.query.category && Product.CATEGORIES.includes(req.query.category)
      ? { category: req.query.category }
      : {};
    const [categories, brands] = await Promise.all([
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Product.aggregate([
        { $match: { ...match, brand: { $nin: [null, ''] } } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
    ]);
    res.status(200).json({
      success: true,
      data: {
        categories: Product.CATEGORIES.map(name => ({
          name,
          count: (categories.find(c => c._id === name) || { count: 0 }).count,
        })),
        brands: brands.map(b => ({ name: b._id, count: b.count })),
        stores: STORES.map(s => ({ key: s.key, name: s.name, domain: s.domain })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Single product with its offers from every store
// @route   GET /api/v1/products/:id
// @access  Public (watchlist/alert info included when logged in)
exports.getProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const product = await Product.findById(req.params.id).select('-key').lean();
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const offers = await Offer.find({ product: product._id }).lean();
    // Found offers first (in stock, cheapest first), then stores without a match
    offers.sort((a, b) =>
      ((b.status === 'FOUND') - (a.status === 'FOUND')) ||
      ((b.inStock ? 1 : 0) - (a.inStock ? 1 : 0)) ||
      ((a.price || Infinity) - (b.price || Infinity))
    );

    let viewer = null;
    if (req.user) {
      const [watchlist, alerts] = await Promise.all([
        Watchlist.findOne({ user: req.user._id, products: product._id }).select('_id'),
        AlertRule.find({ user: req.user._id, product: product._id }),
      ]);
      viewer = { inWatchlist: Boolean(watchlist), alerts };
    }

    res.status(200).json({
      success: true,
      data: {
        ...product,
        offers,
        isQueued: refreshQueue.has(product._id),
        stores: STORES.map(s => ({ key: s.key, name: s.name })),
        viewer,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Price history per store
// @route   GET /api/v1/products/:id/history?days=90
// @access  Public
exports.getProductHistory = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const days = Math.min(parseInt(req.query.days, 10) || 90, 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const history = await PriceHistory.find({ product: req.params.id, capturedAt: { $gte: since } })
      .sort('capturedAt')
      .select('store price mrp inStock capturedAt -_id')
      .lean();
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (err) {
    next(err);
  }
};

// @desc    Find (or add) a product by name or store URL and compare prices
// @route   POST /api/v1/products/discover
// @access  Private
exports.discoverProduct = async (req, res, next) => {
  try {
    const query = typeof req.body.query === 'string' ? req.body.query.trim() : '';
    const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';
    if (!query && !url) {
      return res.status(400).json({ success: false, error: 'Enter a product name or paste a product link' });
    }
    if (query.length > 120 || url.length > 1000) {
      return res.status(400).json({ success: false, error: 'That search is too long' });
    }

    const { product, created } = await discover({ query, url }, req.user);
    if (created || !product.lastCheckedAt) {
      refreshQueue.add(product._id, { priority: 'high', reason: 'discover' });
    }
    res.status(created ? 201 : 200).json({ success: true, created, data: product });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: err.message });
    next(err);
  }
};

// @desc    Re-check prices now
// @route   POST /api/v1/products/:id/refresh
// @access  Private
exports.refreshProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    if (refreshQueue.has(product._id)) {
      return res.status(202).json({ success: true, data: { queued: true }, message: 'Already checking prices' });
    }
    const age = product.lastCheckedAt ? Date.now() - product.lastCheckedAt.getTime() : Infinity;
    if (age < MIN_MANUAL_REFRESH_MS && req.user.role !== 'ADMIN') {
      const minutes = Math.ceil((MIN_MANUAL_REFRESH_MS - age) / 60000);
      return res.status(429).json({
        success: false,
        error: `Prices were checked moments ago. You can refresh again in ${minutes} min.`,
      });
    }
    refreshQueue.add(product._id, { priority: 'high', reason: 'user refresh' });
    res.status(202).json({ success: true, data: { queued: true }, message: 'Checking all stores for the latest prices' });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove a product and all of its data
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    await Promise.all([
      Offer.deleteMany({ product: product._id }),
      PriceHistory.deleteMany({ product: product._id }),
      AlertRule.deleteMany({ product: product._id }),
      Notification.deleteMany({ product: product._id }),
      Watchlist.updateMany({}, { $pull: { products: product._id } }),
    ]);
    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
