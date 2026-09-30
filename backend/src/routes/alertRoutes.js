const express = require('express');
const { createAlert, getAlerts, updateAlert, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All alert routes require authentication
router.use(protect);

router.route('/')
  .post(createAlert)
  .get(getAlerts);

router.route('/:id')
  .patch(updateAlert)
  .delete(deleteAlert);

module.exports = router;
