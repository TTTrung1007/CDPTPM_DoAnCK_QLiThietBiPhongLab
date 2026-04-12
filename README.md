# Hệ Thống Quản Lý Thiết Bị Phòng Lab (QR Management System)

Chào mừng bạn đến với dự án **Hệ Thống Quản Lý Thiết Bị Phòng Lab**. Đây là một ứng dụng web toàn diện được xây dựng trên nền tảng MERN Stack, được thiết kế để đơn giản hóa việc quản lý, theo dõi và mượn trả thiết bị trong các phòng thí nghiệm thông qua mã QR.

## 🌟 Tính năng chính

### dành cho Quản trị viên (Admin)
- **Bảng điều khiển thông minh:** Theo dõi tổng quan số lượng thiết bị, tình trạng mượn trả và các thông số hoạt động.
*   **Quản lý thiết bị:** Thêm, sửa, xóa thiết bị và phân loại theo phòng Lab hoặc danh mục.
- **Quản lý người dùng:** Quản lý danh sách sinh viên/giảng viên, lịch sử mượn và uy tín của người dùng.
- **Phân tích dữ liệu:** Biểu đồ thống kê tần suất sử dụng thiết bị và báo cáo vi phạm (Fine system).
- **Hệ thống QR:** Tự động tạo và in mã QR cho từng thiết bị để quản lý nhanh chóng.

### dành cho Người dùng (Sinh viên/Giảng viên)
- **Danh mục thiết bị:** Tìm kiếm, lọc và xem thông tin chi tiết thiết bị một cách trực quan.
- **Mượn/Trả thiết bị:** Quy trình đặt chỗ (Reservation) và mượn thiết bị linh hoạt.
- **Quét mã QR:** Sử dụng camera để quét mã QR trên thiết bị để xem thông tin hoặc thực hiện mượn/trả nhanh.
- **Lịch sử cá nhân:** Theo dõi lịch sử mượn trả, thông báo và trạng thái các yêu cầu.

## 🛠 Công nghệ sử dụng

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Tính năng đặc biệt:** QR Code generation & scanning, Node-cron (quản lý tác vụ định kỳ).

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MongoDB (Local hoặc Atlas)

### Cài đặt Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo file `.env` và cấu hình các biến môi trường (PORT, MONGODB_URI, JWT_SECRET).
4. Khởi chạy server:
   ```bash
   npm run dev
   ```

### Cài đặt Frontend
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng:
   ```bash
   npm run dev
   ```

## 📁 Cấu trúc thư mục

```text
HeThongQuanLyThietBiLab/
├── backend/            # Mã nguồn phía máy chủ (API, Models, Controllers)
├── frontend/           # Mã nguồn phía người dùng (React components, Pages)
├── database_backup/    # Các bản sao lưu và dữ liệu mẫu
├── README.md           # Tài liệu hướng dẫn dự án
└── .gitignore          # Cấu hình các tệp tin bỏ qua khi upload git
```

## 📝 Giấy phép

Dự án này được phát triển cho mục đích học tập và quản lý nội bộ.

---
**Phát triển bởi [TTTrung1007](https://github.com/TTTrung1007)**
