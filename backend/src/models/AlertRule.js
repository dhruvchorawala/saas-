const mongoose = require('mongoose');

const AlertRuleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['TARGET_PRICE', 'PRICE_DROP_PERCENT', 'BACK_IN_STOCK', 'ANY_PRICE_CHANGE'],
    required: true
  },
  threshold: {
    type: Number,
    // E.g., 50000 for target price, 5 for percentage drop
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// A user shouldn't have duplicate identical rules for the same product
AlertRuleSchema.index({ user: 1, product: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('AlertRule', AlertRuleSchema);
