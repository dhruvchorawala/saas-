const mongoose = require('mongoose');

const AvailabilitySnapshotSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  sourceId: {
    type: mongoose.Schema.ObjectId,
    ref: 'ProductSource'
  },
  seller: { type: String },
  status: {
    type: String,
    enum: ['IN_STOCK', 'OUT_OF_STOCK', 'LIMITED_STOCK', 'PRE_ORDER', 'BACKORDER', 'COMING_SOON', 'UNKNOWN'],
    required: true
  },
  quantity: { type: Number },
  deliveryEstimate: { type: String },
  shippingCost: { type: Number, default: 0 },
  capturedAt: { type: Date, default: Date.now }
}, { timestamps: true });

AvailabilitySnapshotSchema.index({ product: 1, capturedAt: -1 });

module.exports = mongoose.model('AvailabilitySnapshot', AvailabilitySnapshotSchema);
