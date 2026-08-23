const express = require('express');
const { createAlert, getAlerts, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All alert routes require authentication
router.use(protect);

router.route('/')
  .post(createAlert)
  .get(getAlerts);

router.route('/:id')
  .delete(deleteAlert);

module.exports = router;
