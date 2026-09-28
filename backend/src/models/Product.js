const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  variant: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  sourceId: {
    type: mongoose.Schema.ObjectId,
    ref: 'ProductSource',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  trackingStatus: {
    type: String,
    enum: ['ACTIVE', 'PAUSED'],
    default: 'ACTIVE'
  },
  currentPrice: { type: Number },
  previousPrice: { type: Number },
  lowestPrice: { type: Number },
  highestPrice: { type: Number },
  averagePrice: { type: Number },
  priceChange: { type: Number },
  priceChangePercentage: { type: Number },
  availability: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Unknown'],
    default: 'Unknown'
  },
  currency: { type: String, trim: true },
  mrp: { type: Number },
  discount: { type: String, trim: true },
  seller: { type: String, trim: true },
  deliveryCharge: { type: Number },
  shippingCost: { type: Number, default: 0 },
  effectivePrice: { type: Number },
  estimatedDeliveryDate: { type: String, trim: true },
  
  // Product Identity Fields
  internalProductId: { type: String, index: true, sparse: true },
  sourceProductId: { type: String, index: true, sparse: true }, // e.g. B08N5WRWNW
  sku: { type: String, index: true, sparse: true },
  asin: { type: String, index: true, sparse: true },
  gtin: { type: String },
  ean: { type: String },
  upc: { type: String },
  mpn: { type: String },
  modelNumber: { type: String },
  
  // Additional Variant Attributes
  color: { type: String },
  size: { type: String },
  storage: { type: String }
}, { timestamps: true });

// Production Readiness Indexes
ProductSchema.index({ user: 1, name: 1 });
ProductSchema.index({ user: 1, currentPrice: 1 });
ProductSchema.index({ trackingStatus: 1 });
ProductSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
