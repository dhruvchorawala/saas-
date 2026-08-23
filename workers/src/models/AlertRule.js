const mongoose = require('mongoose');

// Simplified Schema for worker access
const AlertRuleSchema = new mongoose.Schema({
  user: mongoose.Schema.ObjectId,
  product: mongoose.Schema.ObjectId,
  type: String,
  threshold: Number,
  isActive: Boolean
});

module.exports = mongoose.models.AlertRule || mongoose.model('AlertRule', AlertRuleSchema);
