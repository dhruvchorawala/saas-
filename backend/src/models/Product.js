const mongoose = require('mongoose');

const CATEGORIES = ['smartphones', 'laptops', 'audio', 'wearables'];

// A product in the shared catalog. Prices are never stored here by hand:
// the best* fields are derived from the live Offer documents after each refresh.
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  brand: { type: String, trim: true },
  category: { type: String, enum: CATEGORIES, default: 'smartphones' },
  // Capacity/size that identifies the exact variant, e.g. "128GB" or "16GB 512GB"
  variant: { type: String, trim: true, default: '' },
  // Text sent to each store's search box
  searchQuery: { type: String, required: true, trim: true },
  // Normalised identity used to avoid duplicate catalog entries
  key: { type: String, required: true, unique: true },
  image: { type: String },

  origin: { type: String, enum: ['CATALOG', 'USER'], default: 'CATALOG' },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },

  // Aggregates computed from current offers
  bestPrice: { type: Number },
  bestStore: { type: String },
  bestUrl: { type: String },
  highestPrice: { type: Number },
  mrp: { type: Number },
  storeCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: false },
  previousBestPrice: { type: Number },
  priceChange: { type: Number, default: 0 },
  priceChangePercentage: { type: Number, default: 0 },
  lowestEverPrice: { type: Number },

  refreshStatus: {
    type: String,
    enum: ['PENDING', 'REFRESHING', 'READY', 'FAILED'],
    default: 'PENDING'
  },
  lastCheckedAt: { type: Date },
  lastError: { type: String },
}, { timestamps: true });

ProductSchema.index({ category: 1, brand: 1 });
ProductSchema.index({ bestPrice: 1 });
ProductSchema.index({ name: 'text', brand: 'text' });

ProductSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Product', ProductSchema);
