require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const userRoutes = require('./routes/userRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const labRoutes = require('./routes/labRoutes');
const fineRoutes = require('./routes/fineRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/feedbacks', feedbackRoutes);

app.get('/', (req, res) => {
  res.send('Lab Equipment API is running...');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Khởi chạy Cron Jobs
  require('./cron/cronJobs')();
  
  // Seed dữ liệu mặc định sau khi database đã sẵn sàng
  try {
    const adminExists = await User.findOne({ student_id: 'admin' });
    if (!adminExists) {
      await User.create({
        fullname: 'Quản trị viên',
        student_id: 'admin',
        password: 'admin',
        role: 'admin'
      });
      console.log('> Tài khoản Admin đã được tạo lại (admin / admin)');
    }

    const studentExists = await User.findOne({ student_id: 'sv001' });
    if (!studentExists) {
      await User.create({
        fullname: 'Nguyễn Văn A',
        student_id: 'sv001',
        password: '123',
        role: 'student'
      });
      console.log('> Tài khoản Sinh viên đã được tạo lại (sv001 / 123)');
    }
  } catch(e) {
    console.error("Lỗi khi tạo dữ liệu mẫu:", e);
  }

  app.listen(PORT, () => {
    console.log(`Server chạy thành công tại http://localhost:${PORT}`);
  });
};

startServer();

