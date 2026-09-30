const Notification = require('../models/Notification');

// @desc    Latest notifications for the user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const [notifications, unread] = await Promise.all([
      Notification.find({ user: req.user.id })
        .sort('-createdAt')
        .limit(50)
        .populate('product', 'name image'),
      Notification.countDocuments({ user: req.user.id, read: false }),
    ]);
    res.status(200).json({ success: true, unread, data: notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Unread count (polled by the navbar)
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const unread = await Notification.countDocuments({ user: req.user.id, read: false });
    res.status(200).json({ success: true, data: { unread } });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
