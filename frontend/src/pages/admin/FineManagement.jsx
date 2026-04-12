import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const FineManagement = () => {
  const [fines, setFines] = useState([]);

  const fetchFines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFines(response.data);
    } catch (error) { console.error('Error fetching fines:', error); }
  };

  useEffect(() => { fetchFines(); }, []);

  const handleAction = async (id, actionType) => {
    if (!window.confirm(`Xác nhận ${actionType === 'pay' ? 'đã thu tiền' : 'tha phạt'}?`)) return;
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/fines/${id}/${actionType}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchFines();
    } catch (error) {
        alert('Có lỗi xảy ra');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <AlertTriangle className="h-8 w-8 text-brand-600" /> Quản lý Phiếu Phạt
      </h1>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời điểm tạo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sinh viên</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lý do</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {fines.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Không có phiếu phạt nào.</td></tr>
            ) : (
              fines.map((fine) => (
                <tr key={fine._id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(fine.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fine.user_id ? `${fine.user_id.fullname} (${fine.user_id.student_id})` : 'Đã xóa'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{fine.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                    {fine.amount.toLocaleString()} đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        fine.status === 'paid' ? 'bg-green-100 text-green-800' :
                        fine.status === 'waived' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                      {fine.status === 'paid' ? 'Đã đóng' : fine.status === 'waived' ? 'Đã tha' : 'Chưa đóng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {fine.status === 'unpaid' && (
                        <div className="flex justify-end gap-2">
                           <button onClick={() => handleAction(fine._id, 'pay')} className="text-green-600 border border-green-200 bg-green-50 hover:bg-green-600 hover:text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors">
                            <CheckCircle size={16} /> Thu tiền
                           </button>
                           <button onClick={() => handleAction(fine._id, 'waive')} className="text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-600 hover:text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors">
                            <XCircle size={16} /> Tha phạt
                           </button>
                        </div>
                    )}
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

export default FineManagement;
