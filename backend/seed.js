const mongoose = require('mongoose');
const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Category = require('./models/Category');
const Lab = require('./models/Lab');
const Fine = require('./models/Fine');
const connectDB = require('./config/db');
const QRCode = require('qrcode');
require('dotenv').config();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data to avoid duplicates/confusion if needed, 
    // but here we just ensure basic ones exist or add new ones.
    
    // 1. Seed Categories
    console.log('--- Seeding Categories ---');
    const categoriesData = [
      { name: 'Kính hiển vi', slug: 'kinh-hien-vi', description: 'Các loại kính hiển vi soi nổi, quang học' },
      { name: 'Máy ly tâm', slug: 'may-ly-tam', description: 'Thiết bị tách hỗn hợp bằng lực ly tâm' },
      { name: 'Cân điện tử', slug: 'can-dien-tu', description: 'Cân phân tích, cân kỹ thuật' },
      { name: 'Thiết bị gia nhiệt', slug: 'thiet-bi-gia-nhiet', description: 'Bếp điện, bể điều nhiệt, tủ sấy' },
      { name: 'Dụng cụ thủy tinh', slug: 'dung-cu-thuy-tinh', description: 'Ống nghiệm, cốc đong, bình định mức' }
    ];
    
    const categories = [];
    for (const cat of categoriesData) {
      let c = await Category.findOne({ name: cat.name });
      if (!c) {
        c = await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      }
      categories.push(c);
    }

    // 2. Seed Labs
    console.log('--- Seeding Labs ---');
    const labsData = [
      { name: 'Phòng thí nghiệm Hóa học (H1)', room_number: 'H1', location: 'Tầng 1, Tòa A', manager_name: 'Trần Văn B' },
      { name: 'Phòng thí nghiệm Sinh học (S2)', room_number: 'S2', location: 'Tầng 2, Tòa B', manager_name: 'Lê Thị C' },
      { name: 'Phòng thí nghiệm Vật lý (V3)', room_number: 'V3', location: 'Tầng 3, Tòa C', manager_name: 'Phạm Văn D' }
    ];

    const labs = [];
    for (const lab of labsData) {
      let l = await Lab.findOne({ name: lab.name });
      if (!l) {
        l = await Lab.create(lab);
        console.log(`Created lab: ${lab.name}`);
      }
      labs.push(l);
    }

    // 3. Seed Users
    console.log('--- Seeding Users ---');
    // Admin
    const adminExists = await User.findOne({ student_id: 'admin' });
    if (!adminExists) {
      await User.create({
        fullname: 'Quản trị viên',
        student_id: 'admin',
        password: 'admin',
        role: 'admin',
        email: 'admin@labhub.edu.vn',
        department: 'Khoa CNTT'
      });
      console.log('Created Admin: admin / admin');
    }

    // Students
    const student1 = await User.findOne({ student_id: 'sv001' });
    if (!student1) {
      await User.create({
        fullname: 'Nguyễn Văn A',
        student_id: 'sv001',
        password: '123',
        role: 'student',
        email: 'nva@student.edu.vn',
        class_name: 'CNTT-K15',
        department: 'Khoa CNTT',
        trust_score: 95
      });
      console.log('Created Student: sv001 / 123');
    }

    const student2 = await User.findOne({ student_id: 'sv002' });
    if (!student2) {
      await User.create({
        fullname: 'Trần Thị B',
        student_id: 'sv002',
        password: '123',
        role: 'student',
        email: 'ttb@student.edu.vn',
        class_name: 'HOA-K16',
        department: 'Khoa Hóa học',
        trust_score: 100
      });
      console.log('Created Student: sv002 / 123');
    }

    // 4. Seed Equipment
    console.log('--- Seeding Equipment ---');
    const sampleEquipments = [
      { 
        name: 'Kính hiển vi soi nổi Olympus SZ61', 
        serial_number: 'SZ61-4501', 
        category_id: categories[0]._id, 
        lab_id: labs[1]._id,
        specs: 'Độ phóng đại 0.67x - 4.5x, zoom ratio 6.7:1',
        condition_score: 90,
        purchase_price: 15000000,
        manual_url: 'https://www.olympus-lifescience.com/en/microscopes/stereo/sz61/'
      },
      { 
        name: 'Máy ly tâm Hettich EBA 200', 
        serial_number: 'EBA-8802', 
        category_id: categories[1]._id, 
        lab_id: labs[0]._id,
        specs: 'Tốc độ tối đa 6000 rpm, RCF tối đa 3461',
        condition_score: 85,
        purchase_price: 22000000,
        manual_url: 'https://www.hettichlab.com/en/centrifugue/eba-200/'
      },
      { 
        name: 'Cân phân tích 4 số lẻ Mettler Toledo', 
        serial_number: 'MT-CAN-99', 
        category_id: categories[2]._id, 
        lab_id: labs[0]._id,
        specs: 'Khả năng cân 220g, độ đọc 0.1mg',
        condition_score: 100,
        purchase_price: 45000000
      },
      { 
        name: 'Tủ sấy Memmert UN55', 
        serial_number: 'MEM-UN55-B', 
        category_id: categories[3]._id, 
        lab_id: labs[1]._id,
        specs: 'Dung tích 53 lít, nhiệt độ tối đa 300 độ C',
        condition_score: 95,
        purchase_price: 35000000
      },
      { 
          name: 'Máy đo pH cầm tay Hanna HI98107', 
          serial_number: 'HI98107-11', 
          category_id: categories[0]._id, 
          lab_id: labs[0]._id,
          specs: 'Độ phân giải 0.1 pH, độ chính xác ±0.1 pH',
          condition_score: 80,
          status: 'maintenance',
          purchase_price: 1200000
      }
    ];

    for (const item of sampleEquipments) {
      let eq = await Equipment.findOne({ serial_number: item.serial_number });
      if (!eq) {
        eq = new Equipment(item);
        const qrDataUrl = await QRCode.toDataURL(`${frontendUrl}/equipment/${eq._id}`);
        eq.qr_code_url = qrDataUrl;
        await eq.save();
        console.log(`Created equipment: ${item.name}`);
      }
    }

    console.log('\n--- ALL SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
