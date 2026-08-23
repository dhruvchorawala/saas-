const express = require('express');
const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All product routes are protected

router.route('/')
  .get(getProducts)
  .post(addProduct);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

router.route('/:id/history')
  .get(exports.getProductHistory || require('../controllers/productController').getProductHistory);

router.route('/:id/intelligence')
  .get(exports.getProductIntelligence || require('../controllers/productController').getProductIntelligence);

router.route('/:id/sellers')
  .get(exports.getProductSellers || require('../controllers/productController').getProductSellers);

module.exports = router;
