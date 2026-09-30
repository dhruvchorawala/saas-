const mongoose = require('mongoose');
const Watchlist = require('../models/Watchlist');
const Product = require('../models/Product');

// @desc    Get user watchlist
// @route   GET /api/v1/watchlist
// @access  Private
exports.getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user.id })
      .populate({ path: 'products', select: '-key' });
    const products = watchlist ? watchlist.products.filter(Boolean) : [];
    res.status(200).json({ success: true, count: products.length, data: products });
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
    if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const watchlist = await Watchlist.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { products: productId } },
      { upsert: true, returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: watchlist.products });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from watchlist
// @route   DELETE /api/v1/watchlist/:productId
// @access  Private
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const watchlist = await Watchlist.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { products: req.params.productId } },
      { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: watchlist ? watchlist.products : [] });
  } catch (err) {
    next(err);
  }
};
