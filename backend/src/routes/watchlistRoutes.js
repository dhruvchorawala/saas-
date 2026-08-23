const express = require('express');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/watchlistController');

const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All watchlist routes are protected

router.route('/')
  .get(getWatchlist)
  .post(addToWatchlist);

router.route('/:productId')
  .delete(removeFromWatchlist);

module.exports = router;
