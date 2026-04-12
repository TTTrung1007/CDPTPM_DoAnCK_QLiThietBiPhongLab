const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('admin_id', 'fullname').sort('-createdAt');
    res.json(logs); // We return array directly so it works nicely
  } catch (error) { res.status(500).json({ message: error.message }); }
};
