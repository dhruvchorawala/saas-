const mongoose = require('mongoose');

const ChangeEventSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: [
      'PRICE_DROP', 'PRICE_INCREASE', 'BACK_IN_STOCK', 'OUT_OF_STOCK',
      'SELLER_CHANGE', 'DELIVERY_CHANGE', 'DISCOUNT_CHANGE',
      'VARIANT_CHANGE', 'SPECIFICATION_CHANGE', 'SOURCE_ERROR'
    ],
    required: true
  },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  difference: { type: Number },
  percentage: { type: Number },
  source: { type: String },
  severity: {
    type: String,
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'INFO'
  },
  confidence: { type: Number, min: 0, max: 100 },
  detectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ChangeEventSchema.index({ product: 1, detectedAt: -1 });
ChangeEventSchema.index({ type: 1, detectedAt: -1 });

module.exports = mongoose.model('ChangeEvent', ChangeEventSchema);
