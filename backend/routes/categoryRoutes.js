const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getAllCategories).post(protect, admin, createCategory);
router.route('/:id').delete(protect, admin, deleteCategory);

module.exports = router;
