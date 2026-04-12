const express = require('express');
const { getUsers, updateUserStatus, createUser, deleteUser, bulkCreateUsers, getUserProfile, updatePassword, getWishlist, toggleWishlist, getTopUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/update-password', protect, updatePassword);
router.get('/wishlist', protect, getWishlist);
router.put('/wishlist/:equipmentId', protect, toggleWishlist);
router.get('/top', protect, admin, getTopUsers);

router.route('/').get(protect, admin, getUsers).post(protect, admin, createUser);
router.route('/bulk-import').post(protect, admin, bulkCreateUsers);
router.route('/:id/status').put(protect, admin, updateUserStatus);
router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;
