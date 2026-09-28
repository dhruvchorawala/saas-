const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  mrp: {
    type: Number
  },
  discount: {
    type: String
  },
  seller: {
    type: String
  },
  availability: {
    type: String
  },
  currency: { type: String },
  shippingCost: { type: Number, default: 0 },
  effectivePrice: { type: Number },
  capturedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Optimize querying historical data ordered by time
PriceHistorySchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
