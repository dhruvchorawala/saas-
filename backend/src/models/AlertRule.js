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
  // Rupees for TARGET_PRICE, percent for PRICE_DROP_PERCENT, unused otherwise
  threshold: { type: Number, min: 0 },
  isActive: { type: Boolean, default: true },
  lastTriggeredAt: { type: Date },
  // Best price at the last trigger, so the same price does not notify twice
  lastTriggeredPrice: { type: Number }
}, { timestamps: true });

// A user shouldn't have duplicate identical rules for the same product
AlertRuleSchema.index({ user: 1, product: 1, type: 1 }, { unique: true });
AlertRuleSchema.index({ product: 1, isActive: 1 });

module.exports = mongoose.model('AlertRule', AlertRuleSchema);
