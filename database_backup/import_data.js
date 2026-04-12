const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = "mongodb://localhost:27017/lab-equipment-db";
const BACKUP_DIR = __dirname; // Thư mục hiện tại chứa các file json

async function importDatabase() {
    try {
        console.log('--- ĐANG KẾT NỐI MONGODB (MÁY MỚI) ---');
        await mongoose.connect(MONGO_URI);
        console.log('Kết nối thành công!');

        // Lấy danh sách các file json trong thư mục hiện tại
        const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
        console.log(`Tìm thấy ${files.length} bảng dữ liệu JSON để nạp.`);

        for (const file of files) {
            const collectionName = file.split('.')[0];
            const filePath = path.join(BACKUP_DIR, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            console.log(`Đang nạp bảng: ${collectionName} (${data.length} bản ghi)...`);
            
            // Xóa dữ liệu cũ nếu có để tránh trùng lặp
            await mongoose.connection.db.collection(collectionName).deleteMany({});
            
            // Chèn dữ liệu mới
            if (data.length > 0) {
               // Cast string IDs to ObjectId using regex for 24 hex chars
               const { ObjectId } = mongoose.Types;
               const processItem = (item) => {
                 for (const key in item) {
                   if (typeof item[key] === 'string' && /^[a-fA-F0-9]{24}$/.test(item[key])) {
                     item[key] = new ObjectId(item[key]);
                   } else if (Array.isArray(item[key])) {
                     item[key] = item[key].map(el => (typeof el === 'string' && /^[a-fA-F0-9]{24}$/.test(el)) ? new ObjectId(el) : el);
                   } else if (typeof item[key] === 'object' && item[key] !== null) {
                     // Check if it's a date or something else before recursing, but simple logic is fine for json dicts
                     if(!item[key].$date) { 
                        processItem(item[key]);
                     }
                   }
                   // Also handle ISODate if it comes as string (though native Mongoose models cast date strings properly, native MongoDB insert needs Dates).
                   if (typeof item[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(item[key])) {
                     item[key] = new Date(item[key]);
                   }
                 }
               };
               data.forEach(processItem);

               await mongoose.connection.db.collection(collectionName).insertMany(data);
               console.log(`✅ Thành công!`);
            } else {
               console.log(`⚪ Bảng trống (bỏ qua).`);
            }
        }

        console.log('\n--- HOÀN TẤT NẠP DỮ LIỆU ---');
        console.log(`Hệ thống đã sẵn sàng hoạt động tại máy mới.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ LỖI KHI NẠP DỮ LIỆU:', err);
        process.exit(1);
    }
}

importDatabase();
