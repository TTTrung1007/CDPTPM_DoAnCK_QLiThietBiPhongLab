const mongoose = require('mongoose');

const returnRecordSchema = new mongoose.Schema({
  borrow_record_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BorrowRecord',
    required: true,
    unique: true
  },
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
  return_date: {
    type: Date,
    default: Date.now,
  },
  condition: {
    type: String,
    enum: ['Bình thường', 'Hỏng hóc', 'Trầy xước', 'Mất'],
    default: 'Bình thường',
  },
  confirmed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  condition_score: {
    type: Number,
    min: 0,
    max: 100,
  }
}, { timestamps: true });

const ReturnRecord = mongoose.model('ReturnRecord', returnRecordSchema);
module.exports = ReturnRecord;
