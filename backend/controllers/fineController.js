const Fine = require('../models/Fine');
const User = require('../models/User');

exports.getAllFines = async (req, res) => {
  try {
    const fines = await Fine.find().populate('user_id', 'fullname student_id').populate('borrow_record_id');
    res.json(fines);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.payFine = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });
    fine.status = 'paid';
    fine.paid_date = new Date();
    await fine.save();
    // Update user pending fines
    await User.findByIdAndUpdate(fine.user_id, { $inc: { pending_fines: -fine.amount } });
    res.json(fine);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.waiveFine = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });
    fine.status = 'waived';
    await fine.save();
    await User.findByIdAndUpdate(fine.user_id, { $inc: { pending_fines: -fine.amount } });
    res.json(fine);
  } catch (error) { res.status(400).json({ message: error.message }); }
};
