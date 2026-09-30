const express = require('express');
const { getDashboardAnalytics, getMarketAnalytics, getPublicStats } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/stats', getPublicStats);
router.get('/market', getMarketAnalytics);
router.get('/dashboard', protect, getDashboardAnalytics);

module.exports = router;
