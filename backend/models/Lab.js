const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  room_number: { type: String, unique: true, sparse: true },
  location: { type: String, required: true },
  capacity: { type: Number, default: 30 },
  operating_hours: { type: String, default: '08:00 - 17:00' },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

const Lab = mongoose.model('Lab', labSchema);
module.exports = Lab;
