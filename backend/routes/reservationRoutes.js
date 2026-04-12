const express = require('express');
const { createReservation, getMyReservations, cancelReservation, getAllReservations, getEquipmentReservations } = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/equipment/:id', protect, getEquipmentReservations);

router.route('/')
  .get(protect, admin, getAllReservations)
  .post(protect, createReservation);

router.route('/my').get(protect, getMyReservations);
router.route('/:id/cancel').put(protect, cancelReservation);

module.exports = router;
