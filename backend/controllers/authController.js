const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { fullname, student_id, password, role } = req.body;
  try {
    const userExists = await User.findOne({ student_id });
    if (userExists) {
      return res.status(400).json({ message: 'Tài khoản này đã tồn tại.' });
    }
    const user = await User.create({
      fullname, student_id, password, role
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullname: user.fullname,
        student_id: user.student_id,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { student_id, password } = req.body;
  try {
    const user = await User.findOne({ student_id });
    if (user && user.isLocked) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa do vi phạm. Vui lòng liên hệ Admin.' });
    }
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullname: user.fullname,
        student_id: user.student_id,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Mã số sinh viên hoặc mật khẩu không chính xác.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
