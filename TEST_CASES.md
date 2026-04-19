# 🧪 Kế hoạch Kiểm Thử & Lịch sử Test Case (Nhóm 4)

Tài liệu này trình bày các kịch bản kiểm thử (Test Cases) cho chức năng cốt lõi: **"Mượn thiết bị qua hệ thống quét mã QR"** (User Story: US-03).

> [!IMPORTANT]
> **Điểm nhấn thuyết trình:** Các Test Case dưới đây không liệt kê ngẫu nhiên mà được ráp nối trực tiếp (Mapping) với các tiêu chí chấp nhận **(Acceptance Criteria - AC)**. Điều này đảm bảo chúng em kiểm thử đúng những gì khách hàng cần.

---

## 🎯 1. Nhắc lại Tiêu chí Chấp nhận (Acceptance Criteria)

- **AC-01**: Hệ thống phân biệt rõ các trạng thái thiết bị bằng màu sắc (Có sẵn, Đang bận, Bảo trì). Chỉ "Có sẵn" mới cho mượn.
- **AC-02**: Bắt buộc yêu cầu sinh viên phải quét mã QR dán trên máy để xác nhận vị trí thực tế trước khi hiện nút mượn.
- **AC-03**: Hệ thống có khả năng báo lỗi nếu sinh viên quét sai thiết bị (Quét thiết bị A nhưng đòi mượn thiết bị B).
- **AC-04**: Sinh viên phải chọn ngày trả dự kiến không được lui về quá khứ, bấm "Gửi Phiếu" để gửi dữ liệu.
- **AC-05**: Sau khi mượn thành công, màn hình lập tức thay đổi trạng thái sang "Đang bận" cho người dùng khác thấy mà không cần tải lại trang (Real-time).

---

## 📋 2. Bảng Danh sách Test Case (Mapping với AC)

| TC ID | Kịch Bản Kiểm Thử (Test Scenario) | Các Bước Tương Tác (Steps) | Dữ Liệu Nhập (Input) | Kết Quả Trả Về (Expected Output) | Trạng Thái | AC Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Kiểm tra hiển thị trạng thái của máy "Có sẵn" | 1. Vào trang chi tiết màn hình Dell. | Chọn màn hình đang trống | Hiện nhãn Xanh lá "Có sẵn", có nút gọi Camera quét QR. | ✅ Pass | `AC-01` |
| **TC-02** | Xem thử máy đang bị người khác mượn | 1. Mở xem máy chiếu đang có người xài. | Chọn thiết bị bận | Hiện nhãn màu Vàng "Đang mượn", ẩn khu vực quét QR. | ✅ Pass | `AC-01` |
| **TC-03** | Chặn mượn thiết bị lỗi/bảo trì | 1. Mở xem Switch Cisco đang hỏng. | Chọn thiết bị bảo trì | Hiện nhãn Đỏ, cấm tương tác mượn/quét QR. | ✅ Pass | `AC-01` |
| **TC-04** | **Kiểm tra luồng Quét QR thành công** | 1. Bấm Quét Camera.<br>2. Hướng vào QR dán trên máy Laptop HP. | Mã QR hợp lệ của Laptop HP | Nút Mượn mở khóa, màn hình xanh báo "Đã xác thực vị trí" | ✅ Pass | `AC-02` |
| **TC-05** | **Bảo mật: Cố tình quét sai mã thiết bị** | 1. Đang mở trang mượn Laptop HP.<br>2. Cố tình cầm máy quét vào QR của con chuột Dell gần đó. | Mã QR của con chuột | Báo lỗi nháy đỏ: "Mã xác nhận không khớp! Vui lòng quét đúng mã dán trên máy này." | ✅ Pass | `AC-03` |
| **TC-06** | Hoàn tất thao tác Mượn (Nhập ngày trả) | 1. Quét mã QR thành công.<br>2. Điền ngày trả hợp lệ.<br>3. Bấm "Gửi phiếu". | Chọn ngày Tương lai | Thông báo "Mượn thành công". Phiếu được đẩy vào hệ thống. | ✅ Pass | `AC-04` |
| **TC-07** | Bắt lỗi chọn ngày trả trong quá khứ | 1. Quét QR xong.<br>2. Cố tình lùi lịch lịch trả về ngày hôm qua. | Chọn ngày Quá khứ | Form chửi lỗi báo "Ngày trả bắt buộc phải từ biểu đồ hiện tại trở đi". Chặn nút mượn. | ✅ Pass | `AC-04` |
| **TC-08** | **Kiểm tra trạng thái cập nhật Real-time** | 1. Đặt mượn thành công con Switch.<br> 2. Mở một trình duyệt ẩn danh khác để xem mã đó. | N/A | Không cần F5. Máy ẩn danh kia tự động đổi sang trạng thái màu vàng "Đang mượn". | ✅ Pass | `AC-05` |

---

## 💡 Hướng dẫn cho buổi Thuyết trình (Khi Giảng viên hỏi)

**👩‍🏫 Giảng viên hỏi:** *"Làm sao cô/thầy biết được các Test Case này có ý nghĩa gì đối với ứng dụng của bạn?"*

**🧑‍🎓 Bạn (Nhóm 4) trả lời:** *"Dạ thưa Thầy/Cô, nhóm em không viết Test Case để liệt kê tính năng một cách bừa bãi. Nhóm em dùng phương pháp **Mapping Test Case với Acceptance Criteria**. <br><br>Cụ thể, Thầy/Cô nhìn vào cột cuối cùng (AC Mapping). Ví dụ Tiêu chí AC-03 yêu cầu thiết bị phải chống gian lận bằng cách quét sai mã. Thì ngay lập tức nhóm em thiết kế **TC-05** mô phỏng tình huống sinh viên cố tình quét QR của thiết bị khác để kiểm chứng hệ thống có ngăn chặn được không. Tất cả các Test Case đều Pass chứng tỏ phần mềm đã đáp ứng 100% nghiệp vụ đặt ra!"*
