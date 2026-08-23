const AlertRule = require('../models/AlertRule');

// @desc    Create new alert
// @route   POST /api/v1/alerts
// @access  Private
exports.createAlert = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const alert = await AlertRule.create(req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Duplicate alert rule for this product' });
    }
    next(err);
  }
};

// @desc    Get user alerts
// @route   GET /api/v1/alerts
// @access  Private
exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await AlertRule.find({ user: req.user.id }).populate('product', 'name image');
    res.status(200).json({ success: true, count: alerts.length, data: alerts });
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
