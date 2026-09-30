const express = require('express');
const { getAdminAnalytics, getUsers, getJobs, refreshStale, refreshAll } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All admin routes require authentication AND the ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getUsers);
router.get('/jobs', getJobs);
router.post('/refresh-stale', refreshStale);
router.post('/refresh-all', refreshAll);

module.exports = router;
