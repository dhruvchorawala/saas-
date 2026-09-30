const mongoose = require('mongoose');

// One price observation for a product on one store, recorded on every refresh.
const PriceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  store: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  inStock: { type: Boolean },
  capturedAt: { type: Date, default: Date.now }
});

PriceHistorySchema.index({ product: 1, capturedAt: -1 });
PriceHistorySchema.index({ capturedAt: -1 });

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
