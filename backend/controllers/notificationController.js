const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification && notification.user_id.toString() === req.user._id.toString()) {
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Đã đánh dấu là đã đọc' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (user_id, title, message, type = 'system') => {
  try {
    const notification = new Notification({ user_id, title, message, type });
    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
