const express = require('express');
const router = express.Router();
const { getAllFeedbacks, createFeedback } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAllFeedbacks).post(protect, createFeedback);

module.exports = router;
