const express = require('express');
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/dashboard')
  .get(getDashboardAnalytics);

module.exports = router;
