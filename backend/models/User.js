const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  student_id: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'technician'],
    default: 'student',
  },
  email: {
    type: String,
  },
  class_name: {
    type: String,
  },
  department: {
    type: String,
  },
  violation_count: {
    type: Number,
    default: 0,
  },
  pending_fines: {
    type: Number,
    default: 0,
  },
  trust_score: {
    type: Number,
    default: 100, // Starts at 100 points
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
