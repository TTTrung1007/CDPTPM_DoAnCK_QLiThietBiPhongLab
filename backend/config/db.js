const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Đang kết nối MongoDB máy chủ local...");
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lab-equipment-db', {
      serverSelectionTimeoutMS: 2000 // Chờ 2 giây nếu không có MongoDB thật sẽ bỏ qua
    });
    console.log(`MongoDB Local Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Mất kết nối MongoDB local. Khởi chạy MongoDB-In-Memory (dữ liệu tạm thời trên RAM)...");
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB In-Memory DB chạy thành công: ${conn.connection.host}`);
    } catch(e) {
      console.error("Lỗi khi khởi chạy DB:", e.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
