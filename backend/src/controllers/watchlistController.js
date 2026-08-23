const Watchlist = require('../models/Watchlist');
const Product = require('../models/Product');

// @desc    Get user watchlist
// @route   GET /api/v1/watchlist
// @access  Private
exports.getWatchlist = async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user.id }).populate({
      path: 'products',
      populate: {
        path: 'sourceId',
        select: 'name domain'
      }
    });

    // Create empty watchlist if it doesn't exist
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user.id, products: [] });
    }

    res.status(200).json({ success: true, data: watchlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to watchlist
// @route   POST /api/v1/watchlist
// @access  Private
exports.addToWatchlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Verify product exists and belongs to user
    const product = await Product.findOne({ _id: productId, user: req.user.id });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found or not owned by you' });
    }

    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user.id, products: [] });
    }

    if (watchlist.products.includes(productId)) {
      return res.status(400).json({ success: false, error: 'Product already in watchlist' });
    }

    watchlist.products.push(productId);
    await watchlist.save();

    res.status(200).json({ success: true, data: watchlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from watchlist
// @route   DELETE /api/v1/watchlist/:productId
// @access  Private
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      return res.status(404).json({ success: false, error: 'Watchlist not found' });
    }

    watchlist.products = watchlist.products.filter(
      p => p.toString() !== productId
    );

    await watchlist.save();

    res.status(200).json({ success: true, data: watchlist });
  } catch (err) {
    next(err);
  }
};
