const Equipment = require('../models/Equipment');
const MaintenanceLog = require('../models/MaintenanceLog');
const BorrowRecord = require('../models/BorrowRecord');
const QRCode = require('qrcode');

const getEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.find({})
      .populate('category_id')
      .populate('lab_id');
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('category_id')
      .populate('lab_id');
    if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEquipment = async (req, res) => {
    const { name, serial_number, manual_url, category_id, lab_id, specs, condition_score, warranty_until, purchase_price, image_url } = req.body;
    try {
      const equipmentExists = await Equipment.findOne({ serial_number });
      if (equipmentExists) return res.status(400).json({ message: 'Mã số Serial đã tồn tại' });
  
      const equipment = new Equipment({ 
        name, serial_number, manual_url, category_id, lab_id, 
        specs, condition_score, warranty_until, purchase_price, image_url
      });

    // Generate QR Content URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const equipmentUrl = `${frontendUrl}/equipment/${equipment._id}`;

    // Use QR Code library to generate base64 image
    const qrDataUrl = await QRCode.toDataURL(equipmentUrl);
    equipment.qr_code_url = qrDataUrl;

    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEquipmentStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

    if ((status === 'maintenance' || status === 'available') && equipment.status === 'borrowed') {
      return res.status(400).json({ message: 'Thiết bị đang được mượn, không thể thay đổi trạng thái thủ công' });
    }

    equipment.status = status;
    await equipment.save();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

    if (equipment.status === 'borrowed') {
      return res.status(400).json({ message: 'Không thể xóa thiết bị khi đang có người mượn' });
    }

    await equipment.deleteOne();
    res.json({ message: 'Đã xóa thiết bị' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalCount = await Equipment.countDocuments();
    const borrowedCount = await Equipment.countDocuments({ status: 'borrowed' });
    const maintenanceCount = await Equipment.countDocuments({ status: 'maintenance' });
    const availableCount = await Equipment.countDocuments({ status: 'available' });
    res.json({ totalCount, availableCount, borrowedCount, maintenanceCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEquipment = async (req, res) => {
    const { name, serial_number, manual_url, category_id, lab_id, specs, condition_score, warranty_until, purchase_price, status, image_url } = req.body;
    try {
      const equipment = await Equipment.findById(req.params.id);
      if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  
      if (serial_number && serial_number !== equipment.serial_number) {
        const existing = await Equipment.findOne({ serial_number });
        if (existing) return res.status(400).json({ message: 'Mã số Serial đã tồn tại' });
      }
  
      if (name !== undefined) equipment.name = name;
      if (serial_number !== undefined) equipment.serial_number = serial_number;
      if (manual_url !== undefined) equipment.manual_url = manual_url;
      if (category_id !== undefined) equipment.category_id = category_id;
      if (lab_id !== undefined) equipment.lab_id = lab_id;
      if (specs !== undefined) equipment.specs = specs;
      if (condition_score !== undefined) equipment.condition_score = condition_score;
      if (warranty_until !== undefined) equipment.warranty_until = warranty_until;
      if (purchase_price !== undefined) equipment.purchase_price = purchase_price;
      if (status !== undefined) equipment.status = status;
      if (image_url !== undefined) equipment.image_url = image_url;

    await equipment.save();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkCreateEquipments = async (req, res) => {
  const { equipments } = req.body;
  if (!equipments || !Array.isArray(equipments)) {
    return res.status(400).json({ message: 'Dữ liệu phải là một mảng các thiết bị' });
  }

  const results = {
    successCount: 0,
    errorCount: 0,
    errors: []
  };

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  for (const item of equipments) {
    try {
      const { name, serial_number } = item;
      if (!name || !serial_number) {
        throw new Error('Tên và Số Serial là bắt buộc');
      }

      const exists = await Equipment.findOne({ serial_number });
      if (exists) {
        throw new Error(`Số Serial ${serial_number} đã tồn tại`);
      }

      const equipment = new Equipment({
        name,
        serial_number,
        manual_url: item.manual_url || '',
        image_url: item.image_url || '',
        category_id: item.category_id || undefined,
        lab_id: item.lab_id || undefined
      });
      const equipmentUrl = `${frontendUrl}/equipment/${equipment._id}`;
      const qrDataUrl = await QRCode.toDataURL(equipmentUrl);
      equipment.qr_code_url = qrDataUrl;

      await equipment.save();
      results.successCount++;
    } catch (error) {
      results.errorCount++;
      results.errors.push({
        item: item.serial_number || item.name || 'Không xác định', 
        message: error.message 
      });
    }
  }

  res.json(results);
};

const createMaintenanceLog = async (req, res) => {
  const { equipment_id, description, technician, cost, status, maintenance_date } = req.body;
  try {
    const log = new MaintenanceLog({
      equipment_id, description, technician, cost, status,
      maintenance_date: maintenance_date || new Date()
    });
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find({ equipment_id: req.params.id }).sort({ maintenance_date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalyticsStats = async (req, res) => {
  try {
    // 1. Phân bổ trạng thái
    const statusData = [
      { name: 'Sẵn sàng', value: await Equipment.countDocuments({ status: 'available' }) },
      { name: 'Đang mượn', value: await Equipment.countDocuments({ status: 'borrowed' }) },
      { name: 'Bảo trì', value: await Equipment.countDocuments({ status: 'maintenance' }) },
    ];

    // 2. Top 5 thiết bị mượn nhiều nhất
    const topBorrowed = await Equipment.find({ borrow_count: { $gt: 0 } })
      .sort({ borrow_count: -1 })
      .limit(5)
      .select('name borrow_count');

    // 3. Hoạt động mượn đồ trong 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activity = await BorrowRecord.aggregate([
      { $match: { borrow_date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$borrow_date" } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ statusData, topBorrowed, activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkDeleteEquipments = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'ID phải là một mảng' });
  }

  try {
    // Không cho phép xóa nếu có thiết bị đang mượn trong danh sách
    const borrowed = await Equipment.find({ _id: { $in: ids }, status: 'borrowed' });
    if (borrowed.length > 0) {
      return res.status(400).json({
        message: `Không thể xóa vì có ${borrowed.length} thiết bị đang được mượn`,
        borrowedItems: borrowed.map(b => b.name)
      });
    }

    await Equipment.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Đã xóa các thiết bị được chọn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUpdateEquipmentStatus = async (req, res) => {
  const { ids, status } = req.body;
  if (!ids || !Array.isArray(ids) || !status) {
    return res.status(400).json({ message: 'Danh sách ID và trạng thái là bắt buộc' });
  }

  try {
    if (status === 'maintenance' || status === 'available') {
      // Chỉ cập nhật những cái không ở trạng thái borrowed
      await Equipment.updateMany(
        { _id: { $in: ids }, status: { $ne: 'borrowed' } },
        { $set: { status: status } }
      );
    } else {
      await Equipment.updateMany(
        { _id: { $in: ids } },
        { $set: { status: status } }
      );
    }
    res.json({ message: 'Đã cập nhật trạng thái cho các thiết bị được chọn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipmentStatus,
  deleteEquipment,
  updateEquipment,
  getDashboardStats,
  bulkCreateEquipments,
  createMaintenanceLog,
  getMaintenanceLogs,
  getAnalyticsStats,
  bulkDeleteEquipments,
  bulkUpdateEquipmentStatus
};
