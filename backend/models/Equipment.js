const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  serial_number: {
    type: String,
    required: true,
    unique: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  lab_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
  },
  status: {
    type: String,
    enum: ['available', 'borrowed', 'maintenance', 'broken', 'lost', 'retired'],
    default: 'available',
  },
  specs: {
    type: mongoose.Schema.Types.Mixed, // flexible object for specifications
  },
  condition_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  warranty_until: {
    type: Date,
  },
  purchase_price: {
    type: Number,
  },
  qr_code_url: {
    type: String, // will store the URL that the QR code points to
  },
  image_url: {
    type: String, // Store URL of the device illustration
  },
  borrow_count: {
    type: Number,
    default: 0,
  },
  manual_url: {
    type: String, // Link to PDF or documentation
  }
}, { timestamps: true });

const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;
