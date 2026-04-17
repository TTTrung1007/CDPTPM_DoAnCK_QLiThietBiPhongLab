import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare } from 'lucide-react';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await axios.get('http://localhost:5000/api/feedbacks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(response.data);
    } catch (error) { console.error('Error fetching feedbacks:', error); }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <MessageSquare className="h-8 w-8 text-brand-600" /> Quản lý Đánh giá Thiết bị
      </h1>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sinh viên</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thiết bị</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đánh giá</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {feedbacks.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Chưa có đánh giá nào.</td></tr>
            ) : (
              feedbacks.map((fb) => (
                <tr key={fb._id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fb.user_id ? `${fb.user_id.fullname} (${fb.user_id.student_id})` : 'Ẩn danh'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fb.equipment_id ? fb.equipment_id.name : 'Đã xóa'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-1">
                    {renderStars(fb.rating)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 italic">
                    "{fb.comment || 'Không có bình luận'}"
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackManagement;
