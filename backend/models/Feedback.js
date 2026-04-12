const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  borrow_record_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  is_resolved: { type: Boolean, default: false }
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
