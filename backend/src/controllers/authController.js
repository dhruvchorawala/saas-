const crypto = require('crypto');
const User = require('../models/User');
const mailer = require('../services/mailer');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // Role is never taken from the request; promote admins with `npm run make-admin`
    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.status(200).json({ success: true, data: {} });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = (req, res) => {
  res.status(200).json({ success: true, data: publicUser(req.user) });
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({ success: true, data: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'That email is already used by another account' });
    }
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Enter your current and new password' });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    const genericReply = { success: true, data: 'If that email is registered, a reset link has been sent.' };

    // Same reply whether or not the account exists, so emails can't be enumerated
    if (!user) return res.status(200).json(genericReply);

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    if (mailer.isConfigured()) {
      try {
        await mailer.sendMail({
          to: user.email,
          subject: 'Reset your password',
          text: `Hi ${user.name},\n\nReset your password within 10 minutes using this link:\n${resetUrl}\n\nIf you didn't ask for this, ignore this email.`,
        });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ success: false, error: 'Email could not be sent. Try again later.' });
      }
    } else {
      // No SMTP configured (local development): print the link instead of emailing it
      console.log(`[auth] Password reset link for ${user.email}: ${resetUrl}`);
    }

    res.status(200).json(genericReply);
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'This reset link is invalid or has expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}

// Get token from model, create cookie and send response
function sendTokenResponse(user, statusCode, res) {
  const token = user.getSignedJwtToken();
  const days = Number(process.env.JWT_COOKIE_EXPIRE) || 30;

  res.status(statusCode)
    .cookie('token', token, { ...cookieOptions(), expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000) })
    .json({ success: true, token, data: publicUser(user) });
}
