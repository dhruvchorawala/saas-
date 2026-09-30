const mongoose = require('mongoose');

// In-app notification created when an alert rule fires.
const NotificationSchema = new mongoose.Schema({
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
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  emailStatus: {
    type: String,
    enum: ['NOT_CONFIGURED', 'SENT', 'FAILED'],
    default: 'NOT_CONFIGURED'
  }
}, { timestamps: true });

NotificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
