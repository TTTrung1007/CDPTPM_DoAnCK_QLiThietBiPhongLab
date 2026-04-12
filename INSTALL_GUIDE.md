# 🛠️ Hướng dẫn cài đặt Hệ thống Quản lý Thiết bị Lab (LabHub)

Tài liệu này giúp bạn thiết lập dự án từ đầu trên một máy tính mới.

---

## 1. Yêu cầu hệ thống (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:
1.  **Node.js**: [Tải tại đây (Bản LTS)](https://nodejs.org/)
2.  **MongoDB Community Server**: [Tải tại đây](https://www.mongodb.com/try/download/community)
3.  **MongoDB Compass** (Tùy chọn - để xem dữ liệu trực quan): [Tải tại đây](https://www.mongodb.com/products/compass)

---

## 2. Các bước cài đặt

### Bước 1: Cài đặt thư viện (Dependencies)
Mở Terminal (cmd hoặc PowerShell) và thực hiện:

**Cài đặt cho Backend:**
```bash
cd backend
npm install
```

**Cài đặt cho Frontend:**
```bash
cd ../frontend
npm install
```

### Bước 2: Nạp dữ liệu (Database Restore)
Tôi đã chuẩn bị sẵn thư mục `database_backup`. Để nạp dữ liệu vào máy mới:
1.  Mở Terminal tại thư mục gốc của dự án.
2.  Chạy lệnh sau (đã viết sẵn script tự động):
    ```bash
    cd database_backup
    node import_data.js
    ```
    *Dữ liệu sẽ được nạp vào Database tên là `lab-equipment-db`.*

### Bước 3: Cấu hình môi trường (.env)
Vào thư mục `backend`, kiểm tra file `.env`. Đảm bảo dòng sau khớp với máy của bạn:
```env
MONGO_URI=mongodb://127.0.0.1:27017/lab-equipment-db
```

### Bước 4: Khởi chạy ứng dụng
Chạy đồng thời cả 2 Terminal:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 3. Thông tin đăng nhập mặc định (Tài khoản Admin)
- **Email**: `admin@lab.com` (hoặc email admin bạn đã tạo)
- **Mật khẩu**: `123456`

---
**Lưu ý**: Nếu gặp lỗi không nhận diện lệnh `node` hay `npm`, hãy kiểm tra xem bạn đã thêm Node.js vào **Environment Variables (PATH)** của Windows chưa.
