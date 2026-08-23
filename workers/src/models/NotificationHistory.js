const mongoose = require('mongoose');

const NotificationHistorySchema = new mongoose.Schema({
  user: mongoose.Schema.ObjectId,
  product: mongoose.Schema.ObjectId,
  alertRule: mongoose.Schema.ObjectId,
  status: String,
  message: String,
  provider: String,
  errorDetails: String
}, { timestamps: true });

module.exports = mongoose.models.NotificationHistory || mongoose.model('NotificationHistory', NotificationHistorySchema);
