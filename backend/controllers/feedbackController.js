const Feedback = require('../models/Feedback');
const BorrowRecord = require('../models/BorrowRecord');

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user_id', 'fullname student_id').populate('equipment_id', 'name serial_number').sort('-createdAt');
    res.json(feedbacks);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createFeedback = async (req, res) => {
  try {
    const { equipment_id, borrow_record_id, rating, comment } = req.body;
    const feedback = new Feedback({
      user_id: req.user._id,
      equipment_id,
      borrow_record_id,
      rating,
      comment
    });
    await feedback.save();
    
    if (borrow_record_id) {
       await BorrowRecord.findByIdAndUpdate(borrow_record_id, { rating_id: feedback._id });
    }
    
    res.status(201).json(feedback);
  } catch (error) { res.status(400).json({ message: error.message }); }
};
