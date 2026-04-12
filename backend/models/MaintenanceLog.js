const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  technician: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  maintenance_date: {
    type: Date,
    default: Date.now,
  },
  maintenance_type: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'calibration', 'upgrade', 'cleaning'],
    default: 'routine',
  },
  parts_replaced: {
    type: String,
  },
  condition_before: {
    type: String,
  },
  condition_after: {
    type: String,
  },
  next_maintenance_date: {
    type: Date,
  },
}, { timestamps: true });

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
module.exports = MaintenanceLog;
