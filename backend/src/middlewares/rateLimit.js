const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // generous: product pages poll while prices are being fetched
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' }
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again in 15 minutes' }
});

// Each discovery triggers searches on every store, so keep it modest
exports.discoverLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'You have searched for many new products. Please try again in an hour.' }
});
