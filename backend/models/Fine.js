const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrow_record_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'waived'], default: 'unpaid' },
  paid_date: { type: Date }
}, { timestamps: true });

const Fine = mongoose.model('Fine', fineSchema);
module.exports = Fine;
