const mongoose = require('mongoose');

// The latest listing found for a product on one store.
const OfferSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  store: { type: String, required: true },      // store key, e.g. "amazon"
  storeName: { type: String, required: true },  // display name, e.g. "Amazon.in"
  status: {
    type: String,
    enum: ['FOUND', 'NOT_FOUND', 'ERROR'],
    required: true
  },
  title: { type: String },
  url: { type: String },
  image: { type: String },
  price: { type: Number },
  mrp: { type: Number },
  inStock: { type: Boolean, default: true },
  matchScore: { type: Number },
  error: { type: String },
  lastCheckedAt: { type: Date, default: Date.now }
}, { timestamps: true });

OfferSchema.index({ product: 1, store: 1 }, { unique: true });

module.exports = mongoose.model('Offer', OfferSchema);
