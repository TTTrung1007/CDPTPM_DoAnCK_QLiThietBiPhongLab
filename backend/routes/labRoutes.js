const express = require('express');
const router = express.Router();
const { getAllLabs, createLab, deleteLab } = require('../controllers/labController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getAllLabs).post(protect, admin, createLab);
router.route('/:id').delete(protect, admin, deleteLab);

module.exports = router;
