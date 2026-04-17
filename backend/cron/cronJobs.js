const cron = require('node-cron');
const BorrowRecord = require('../models/BorrowRecord');
const Fine = require('../models/Fine');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');

const initCronJobs = () => {
  // Chạy mỗi phút cho mục đích kiểm thử (test). Thực tế nên để '1 0 * * *' (00:01 mỗi ngày)
  cron.schedule('* * * * *', async () => {
    console.log('[CRON] Đang quét các thiết bị mượn quá hạn...');
    try {
      const now = new Date();
      // Tìm các record chưa trả và có expected_return_date < now
      const overdueRecords = await BorrowRecord.find({
        status: 'active',
        is_overdue: false,
        expected_return_date: { $lt: now }
      });

      for (const record of overdueRecords) {
        record.is_overdue = true;
        const diffTime = Math.abs(now - record.expected_return_date);
        record.overdue_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Trừ điểm uy tín
        await User.findByIdAndUpdate(record.user_id, {
          $inc: { trust_score: -5 }
        });

        // Tạo phiếu phạt
        const fine = new Fine({
          user_id: record.user_id,
          borrow_record_id: record._id,
          amount: 50000, // 50k VND / lần
          reason: 'Trễ hạn trả thiết bị',
        });
        await fine.save();
        
        // Cập nhật lại record
        record.fine_id = fine._id;
        await record.save();
        
        // Cộng pending fine cho User
        await User.findByIdAndUpdate(record.user_id, {
          $inc: { pending_fines: fine.amount }
        });
        console.log(`[CRON] Đã tạo phạt cho BorrowRecord ${record._id}`);
      }
      if (overdueRecords.length === 0) {
        console.log('[CRON] Không có thiết bị quá hạn mới.');
      }

      // --- XỬ LÝ LỊCH ĐẶT CHỖ ---
      // 1. Tự động chuyển thành "BorrowRecord" (Đang mượn) nếu đến giờ đặt chỗ
      const activeReservations = await Reservation.find({
        status: 'confirmed',
        startTime: { $lte: now },
        endTime: { $gt: now }
      });
      for (const res of activeReservations) {
        const eq = await Equipment.findById(res.equipment_id);
        if (eq && (eq.status === 'available' || eq.status === 'reserved')) {
          res.status = 'completed';
          await res.save();

          const record = await BorrowRecord.create({
            user_id: res.user_id,
            equipment_id: res.equipment_id,
            expected_return_date: res.endTime
          });

          eq.status = 'borrowed';
          eq.borrow_count = (eq.borrow_count || 0) + 1;
          await eq.save();
          console.log(`[CRON] Đã tự động mượn thiết bị ${eq.name} cho user ${res.user_id}`);
        } else if (eq) {
          res.status = 'cancelled';
          await res.save();
        }
      }

      // 2. Cập nhật lịch đặt chỗ hết hạn -> "expired" (nếu có trường hợp bị lọt)
      const expiredReservations = await Reservation.find({
        status: 'confirmed',
        endTime: { $lte: now }
      });
      for (const res of expiredReservations) {
        res.status = 'expired';
        await res.save();
      }
    } catch (error) {
      console.error('[CRON] Lỗi:', error);
    }
  });
};

module.exports = initCronJobs;
