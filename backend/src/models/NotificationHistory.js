const mongoose = require('mongoose');

const NotificationHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  },
  alertRule: {
    type: mongoose.Schema.ObjectId,
    ref: 'AlertRule'
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED'],
    default: 'PENDING'
  },
  message: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['EMAIL', 'TELEGRAM', 'WHATSAPP'],
    required: true
  },
  errorDetails: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationHistory', NotificationHistorySchema);
