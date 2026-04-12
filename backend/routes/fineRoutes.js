const express = require('express');
const router = express.Router();
const { getAllFines, payFine, waiveFine } = require('../controllers/fineController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAllFines);
router.route('/:id/pay').put(protect, admin, payFine);
router.route('/:id/waive').put(protect, admin, waiveFine);

module.exports = router;
