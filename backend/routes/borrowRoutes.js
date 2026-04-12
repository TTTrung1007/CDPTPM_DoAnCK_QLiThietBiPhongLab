const express = require('express');
const { borrowEquipment, getMyHistory, getActiveRecords, confirmReturn, bulkBorrowEquipment, getUserHistoryAdmin } = require('../controllers/borrowController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, borrowEquipment);
router.route('/bulk').post(protect, bulkBorrowEquipment);
router.route('/myhistory').get(protect, getMyHistory);
router.route('/active').get(protect, admin, getActiveRecords);
router.route('/user/:userId').get(protect, admin, getUserHistoryAdmin);
router.route('/:id/return').put(protect, admin, confirmReturn);

module.exports = router;
