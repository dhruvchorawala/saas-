const mongoose = require('mongoose');
const AlertRule = require('../models/AlertRule');
const Product = require('../models/Product');

const TYPES = ['TARGET_PRICE', 'PRICE_DROP_PERCENT', 'BACK_IN_STOCK', 'ANY_PRICE_CHANGE'];

function validateThreshold(type, threshold) {
  if (type === 'TARGET_PRICE') {
    if (!(threshold > 0)) return 'Enter a target price greater than ₹0';
  }
  if (type === 'PRICE_DROP_PERCENT') {
    if (!(threshold > 0 && threshold < 100)) return 'Enter a drop percentage between 1 and 99';
  }
  return null;
}

// @desc    Create new alert
// @route   POST /api/v1/alerts
// @access  Private
exports.createAlert = async (req, res, next) => {
  try {
    const { product: productId, type } = req.body;
    const threshold = req.body.threshold === undefined || req.body.threshold === '' ? undefined : Number(req.body.threshold);

    if (!TYPES.includes(type)) {
      return res.status(400).json({ success: false, error: 'Choose a valid alert type' });
    }
    const thresholdError = validateThreshold(type, threshold);
    if (thresholdError) return res.status(400).json({ success: false, error: thresholdError });
    if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const alert = await AlertRule.create({ user: req.user.id, product: productId, type, threshold });
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'You already have this type of alert for this product' });
    }
    next(err);
  }
};

// @desc    Get user alerts
// @route   GET /api/v1/alerts
// @access  Private
exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await AlertRule.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('product', 'name image bestPrice bestStore inStock category');
    res.status(200).json({ success: true, count: alerts.length, data: alerts.filter(a => a.product) });
  } catch (err) {
    next(err);
  }
};

// @desc    Pause/resume an alert or change its threshold
// @route   PATCH /api/v1/alerts/:id
// @access  Private
exports.updateAlert = async (req, res, next) => {
  try {
    const alert = await AlertRule.findOne({ _id: req.params.id, user: req.user.id });
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    if (typeof req.body.isActive === 'boolean') alert.isActive = req.body.isActive;
    if (req.body.threshold !== undefined) {
      const threshold = Number(req.body.threshold);
      const thresholdError = validateThreshold(alert.type, threshold);
      if (thresholdError) return res.status(400).json({ success: false, error: thresholdError });
      alert.threshold = threshold;
      alert.lastTriggeredPrice = undefined;
    }
    await alert.save();
    res.status(200).json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete alert
// @route   DELETE /api/v1/alerts/:id
// @access  Private
exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await AlertRule.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
