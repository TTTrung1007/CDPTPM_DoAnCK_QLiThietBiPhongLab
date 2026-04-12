const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
  },
  borrow_date: {
    type: Date,
    default: Date.now,
  },
  expected_return_date: {
    type: Date,
    required: true,
  },
  actual_return_date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'returned'],
    default: 'active',
  },
  purpose: {
    type: String,
  },
  is_overdue: {
    type: Boolean,
    default: false,
  },
  overdue_days: {
    type: Number,
    default: 0,
  },
  fine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fine',
  },
  rating_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
  },
}, { timestamps: true });

const BorrowRecord = mongoose.model('BorrowRecord', borrowRecordSchema);
module.exports = BorrowRecord;
