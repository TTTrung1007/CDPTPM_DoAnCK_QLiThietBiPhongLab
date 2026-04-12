const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
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
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  note: {
    type: String,
  }
}, { timestamps: true });

// Ensure startTime is before endTime
reservationSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    next(new Error('Thời gian bắt đầu phải trước thời gian kết thúc.'));
  }
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
