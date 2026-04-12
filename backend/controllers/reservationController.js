const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const { createNotification } = require('./notificationController');

// @desc    Create new reservation
// @route   POST /api/reservations
const createReservation = async (req, res) => {
  const { equipment_id, startTime, endTime, note } = req.body;
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start < new Date()) {
       return res.status(400).json({ message: 'Không thể đặt chỗ trong quá khứ' });
    }

    // Check for conflicts
    const conflict = await Reservation.findOne({
      equipment_id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Thiết bị đã có người đặt trong khoảng thời gian này.' });
    }

    const reservation = await Reservation.create({
      user_id: req.user._id,
      equipment_id,
      startTime: start,
      endTime: end,
      note
    });

    // Create notification
    const eq = await Equipment.findById(equipment_id);
    await createNotification(
       req.user._id,
       'Đặt lịch thành công',
       `Bạn đã đặt chỗ cho thiết bị "${eq?.name}". Thời gian: ${start.toLocaleString('vi-VN')}`,
       'reservation'
    );

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user reservations
// @route   GET /api/reservations/my
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user_id: req.user._id })
      .populate('equipment_id', 'name serial_number')
      .sort({ startTime: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Không tìm thấy lịch đặt.' });

    if (reservation.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Không có quyền hủy lịch này.' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Create notification
    const eq = await Equipment.findById(reservation.equipment_id);
    await createNotification(
      reservation.user_id,
      'Đã hủy lịch đặt chỗ',
      `Lịch đặt chỗ cho thiết bị "${eq?.name}" đã được hủy.`,
      'reservation'
    );

    res.json({ message: 'Đã hủy lịch đặt chỗ.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all (Admin)
// @route   GET /api/reservations
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('user_id', 'fullname student_id')
      .populate('equipment_id', 'name serial_number')
      .sort({ startTime: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEquipmentReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      equipment_id: req.params.id,
      status: { $in: ['confirmed', 'pending'] }
    })
    .populate('user_id', 'fullname')
    .sort({ startTime: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  getEquipmentReservations
};
