const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = "mongodb://127.0.0.1:27017/lab-equipment-db";
const BACKUP_DIR = __dirname; 

async function exportDatabase() {
    try {
        console.log('--- ĐANG KẾT NỐI MONGODB ---');
        await mongoose.connect(MONGO_URI);
        console.log('Kết nối thành công!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`Tìm thấy ${collections.length} bảng dữ liệu để sao lưu.`);

        for (const col of collections) {
            const collectionName = col.name;
            // Tránh backup các system collections
            if (collectionName.startsWith('system.')) continue;

            console.log(`Đang trích xuất bảng: ${collectionName}...`);
            const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
            
            const filePath = path.join(BACKUP_DIR, `${collectionName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`✅ Đã lưu ${data.length} bản ghi vào ${collectionName}.json`);
        }

        console.log('\n--- HOÀN TẤT SAO LƯU DỮ LIỆU ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ LỖI KHI SAO LƯU DỮ LIỆU:', err);
        process.exit(1);
    }
}

exportDatabase();
