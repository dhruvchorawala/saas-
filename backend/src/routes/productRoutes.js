const express = require('express');
const {
  getProducts,
  getFacets,
  getProduct,
  getProductHistory,
  discoverProduct,
  refreshProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, optionalAuth, authorize } = require('../middlewares/auth');
const { discoverLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

// Browsing the catalog is public; changing it requires an account
router.get('/', getProducts);
router.get('/facets', getFacets);
router.post('/discover', protect, discoverLimiter, discoverProduct);

router.route('/:id')
  .get(optionalAuth, getProduct)
  .delete(protect, authorize('ADMIN'), deleteProduct);

router.get('/:id/history', getProductHistory);
router.post('/:id/refresh', protect, refreshProduct);

module.exports = router;
