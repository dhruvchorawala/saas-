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
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
