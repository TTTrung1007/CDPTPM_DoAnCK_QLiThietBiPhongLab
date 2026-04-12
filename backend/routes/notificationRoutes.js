const express = require('express');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getMyNotifications)
  .put(protect, markAllAsRead);

router.route('/:id/read').put(protect, markAsRead);

module.exports = router;
