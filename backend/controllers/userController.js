const User = require('../models/User');
const Borrow = require('../models/BorrowRecord');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Lấy chi tiết thiết bị đang mượn
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const allBorrows = await Borrow.find({ user_id: u._id }).populate('equipment_id', 'name');
      const activeBorrows = allBorrows.filter(b => b.status === 'active');
      
      return { 
        ...u._doc, 
        activeBorrowsCount: activeBorrows.length,
        totalBorrowsCount: allBorrows.length,
        borrowedItems: activeBorrows.map(b => b.equipment_id ? b.equipment_id.name : 'Không xác định')
      };
    }));
    
    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  const { isLocked, role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (user.student_id === 'admin' && isLocked === true) {
      return res.status(400).json({ message: 'Không thể khóa tài khoản admin gốc' });
    }

    if (isLocked !== undefined) user.isLocked = isLocked;
    if (role !== undefined) user.role = role;
    
    await user.save();
    res.json({ message: 'Đã cập nhật trạng thái người dùng', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const { fullname, student_id, password, role } = req.body;
  if (!fullname || !student_id || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
  }
  try {
    const exists = await User.findOne({ student_id });
    if (exists) {
      return res.status(400).json({ message: `Mã tài khoản "${student_id}" đã tồn tại trong hệ thống.` });
    }
    const newUser = await User.create({
      fullname,
      student_id,
      password,
      role: role || 'student',
    });
    res.status(201).json({ message: 'Tạo tài khoản thành công!', user: { _id: newUser._id, fullname: newUser.fullname, student_id: newUser.student_id, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    if (user.student_id === 'admin') return res.status(400).json({ message: 'Không thể xóa tài khoản admin gốc.' });

    // Không cho xóa nếu đang mượn thiết bị
    const activeBorrow = await Borrow.findOne({ user_id: user._id, status: 'active' });
    if (activeBorrow) return res.status(400).json({ message: 'Tài khoản này đang mượn thiết bị, không thể xóa.' });

    await user.deleteOne();
    res.json({ message: 'Đã xóa tài khoản thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkCreateUsers = async (req, res) => {
  const { users } = req.body;
  if (!users || !Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'Danh sách tài khoản không hợp lệ.' });
  }

  const results = { success: 0, skipped: 0, errors: [] };

  for (const u of users) {
    if (!u.fullname || !u.student_id || !u.password) {
      results.errors.push(`Dòng thiếu dữ liệu: ${u.student_id || '(không có mã)'}`);
      results.skipped++;
      continue;
    }
    try {
      const exists = await User.findOne({ student_id: String(u.student_id) });
      if (exists) {
        results.skipped++;
        results.errors.push(`"${u.student_id}" đã tồn tại, bỏ qua.`);
        continue;
      }
      await User.create({
        fullname: String(u.fullname),
        student_id: String(u.student_id),
        password: String(u.password),
        role: u.role === 'admin' ? 'admin' : 'student',
      });
      results.success++;
    } catch (err) {
      results.skipped++;
      results.errors.push(`Lỗi "${u.student_id}": ${err.message}`);
    }
  }

  res.status(201).json({ message: `Nhập thành công ${results.success} tài khoản, bỏ qua ${results.skipped}.`, ...results });
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    
    // Đếm số lượng mượn
    const active = await Borrow.countDocuments({ user_id: req.user._id, status: 'active' });
    const total = await Borrow.countDocuments({ user_id: req.user._id });
    
    res.json({
      ...user._doc,
      stats: { active, total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name serial_number status qr_code_url borrow_count');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    const equipId = req.params.equipmentId;
    const idx = user.wishlist.findIndex(id => id.toString() === equipId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(equipId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopUsers = async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'student' })
      .sort({ trust_score: -1 })
      .limit(5)
      .select('fullname student_id trust_score class_name');
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { fullname, student_id, role, password } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (user.student_id === 'admin' && student_id && student_id !== 'admin') {
      return res.status(400).json({ message: 'Không thể thay đổi mã của admin gốc' });
    }

    if (fullname) user.fullname = fullname;
    if (student_id) user.student_id = student_id;
    if (role) user.role = role;
    if (password) user.password = password; // pre-save hook in user model will hash it

    const updatedUser = await user.save();
    res.json({ message: 'Cập nhật tài khoản thành công', user: { _id: updatedUser._id, fullname: updatedUser.fullname, student_id: updatedUser.student_id, role: updatedUser.role } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Mã số sinh viên (Tài khoản) đã tồn tại trong hệ thống.' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getUsers, 
  updateUserStatus, 
  createUser, 
  updateUser,
  deleteUser, 
  bulkCreateUsers,
  getUserProfile,
  updatePassword,
  getWishlist,
  toggleWishlist,
  getTopUsers
};
