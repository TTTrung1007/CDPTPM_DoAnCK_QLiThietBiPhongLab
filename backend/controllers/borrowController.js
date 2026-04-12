const BorrowRecord = require('../models/BorrowRecord');
const ReturnRecord = require('../models/ReturnRecord');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const borrowEquipment = async (req, res) => {
  const { equipment_id, expected_return_date } = req.body;
  try {
    const equipment = await Equipment.findById(equipment_id);
    if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    if (equipment.status !== 'available') {
      return res.status(400).json({ message: 'Thiết bị hiện không sẵn sàng để mượn' });
    }

    const record = await BorrowRecord.create({
      user_id: req.user._id,
      equipment_id,
      expected_return_date
    });

    equipment.status = 'borrowed';
    equipment.borrow_count = (equipment.borrow_count || 0) + 1;
    await equipment.save();

    // Create notification
    await createNotification(
      req.user._id,
      'Mượn thiết bị thành công',
      `Bạn đã mượn thiết bị "${equipment.name}". Hạn trả: ${new Date(expected_return_date).toLocaleDateString('vi-VN')}`,
      'borrow'
    );

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyHistory = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ user_id: req.user._id }).populate('equipment_id', 'name serial_number status');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveRecords = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ status: 'active' })
      .populate('user_id', 'fullname student_id')
      .populate('equipment_id', 'name serial_number');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmReturn = async (req, res) => {
  const { condition, notes, condition_score } = req.body;
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record || record.status === 'returned') {
      return res.status(404).json({ message: 'Không tìm thấy thông tin mượn hoặc thiết bị đã được trả' });
    }

    record.status = 'returned';
    record.actual_return_date = Date.now();
    await record.save();

    // Create a detailed return record
    await ReturnRecord.create({
      borrow_record_id: record._id,
      user_id: record.user_id,
      equipment_id: record.equipment_id,
      condition: condition || 'Bình thường',
      notes: notes || '',
      confirmed_by: req.user._id
    });

    const equipment = await Equipment.findById(record.equipment_id);
    if (equipment) {
      // Update equipment status based on condition
      if (condition === 'Hỏng hóc') {
        equipment.status = 'broken';
      } else if (condition === 'Mất') {
        equipment.status = 'lost';
      } else {
        equipment.status = 'available';
      }

      // Update condition score if provided
      if (condition_score !== undefined) {
        equipment.condition_score = condition_score;
      }

      await equipment.save();

      // Create notification for the user who borrowed
      await createNotification(
        record.user_id,
        'Xác nhận trả thiết bị',
        `Thiết bị "${equipment.name}" bạn mượn đã được xác nhận trả thành công. Tình trạng: ${condition || 'Bình thường'}.`,
        'borrow'
      );
    }

    res.json({ message: 'Xác nhận trả thiết bị thành công', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkBorrowEquipment = async (req, res) => {
  const { equipment_ids, expected_return_date } = req.body;
  if (!equipment_ids || !Array.isArray(equipment_ids)) {
    return res.status(400).json({ message: 'Danh sách ID thiết bị là bắt buộc' });
  }

  try {
    const equipments = await Equipment.find({ _id: { $in: equipment_ids } });
    const unavailable = equipments.filter(e => e.status !== 'available');
    if (unavailable.length > 0) {
      return res.status(400).json({ 
        message: `Có ${unavailable.length} thiết bị hiện không sẵn sàng`,
        unavailableItems: unavailable.map(u => u.name)
      });
    }

    const records = [];
    for (const eq of equipments) {
      const record = await BorrowRecord.create({
        user_id: req.user._id,
        equipment_id: eq._id,
        expected_return_date
      });
      eq.status = 'borrowed';
      eq.borrow_count = (eq.borrow_count || 0) + 1;
      await eq.save();
      records.push(record);
    }

    // Create notification
    await createNotification(
      req.user._id,
      'Mượn nhiều thiết bị thành công',
      `Bạn đã mượn ${equipments.length} thiết bị thành công. Hạn trả: ${new Date(expected_return_date).toLocaleDateString('vi-VN')}`,
      'borrow'
    );

    res.status(201).json({ message: 'Mượn thiết bị thành công', count: records.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserHistoryAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('fullname student_id role isLocked');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const records = await BorrowRecord.find({ user_id: req.params.userId })
         .populate('equipment_id', 'name serial_number status')
         .sort({ borrow_date: -1 });
    
    res.json({ user, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { borrowEquipment, getMyHistory, getActiveRecords, confirmReturn, bulkBorrowEquipment, getUserHistoryAdmin };
