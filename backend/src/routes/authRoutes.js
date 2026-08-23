const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
