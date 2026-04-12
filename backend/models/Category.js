const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String, default: 'Box' },
  color: { type: String, default: '#3b82f6' }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
