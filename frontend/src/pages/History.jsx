import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { History as HistoryIcon, Clock, CheckCircle, Star, CalendarDays, Trash2 } from 'lucide-react';

const History = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('borrows');

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null); // { borrow_record_id, equipment_id, name }
  const [ratingVal, setRatingVal] = useState(5);
  const [comment, setComment] = useState('');

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchHistoryAndReservations = async () => {
    try {
      const [{ data: borrows }, { data: resvs }] = await Promise.all([
        axios.get('http://localhost:5000/api/borrow/myhistory', config),
        axios.get('http://localhost:5000/api/reservations/my', config)
      ]);
      setRecords(borrows);
      setReservations(resvs);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoryAndReservations();
  }, [user.token]);

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch đặt này?')) return;
    try {
      await axios.put(`http://localhost:5000/api/reservations/${id}/cancel`, {}, config);
      fetchHistoryAndReservations();
    } catch (error) {
      alert('Không thể hủy lịch đặt này');
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/feedbacks', {
        equipment_id: ratingTarget.equipment_id,
        borrow_record_id: ratingTarget.borrow_record_id,
        rating: ratingVal,
        comment
      }, config);
      alert('Đánh giá thành công! Cảm ơn bạn.');
      setShowRatingModal(false);
      fetchHistoryAndReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) return <div className="flex justify-center my-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-brand-500" />
          Quản lý Mượn / Đặt Lịch
        </h1>
        <p className="text-gray-500 mt-1">Theo dõi thiết bị bạn đang mượn và lịch đặt trước</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('borrows')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'borrows' ? 'bg-brand-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Lịch sử Mượn
        </button>
        <button 
          onClick={() => setActiveTab('reservations')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'reservations' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Lịch Đặt Trước
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'borrows' ? (
          records.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Bạn chưa mượn thiết bị nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                    <th className="py-4 px-6 font-semibold">Tên thiết bị</th>
                    <th className="py-4 px-6 font-semibold">Serial</th>
                    <th className="py-4 px-6 font-semibold">Ngày mượn</th>
                    <th className="py-4 px-6 font-semibold">Hạn trả</th>
                    <th className="py-4 px-6 font-semibold">Trạng thái</th>
                    <th className="py-4 px-6 font-semibold">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{record.equipment_id?.name || 'N/A'}</td>
                      <td className="py-4 px-6 text-gray-500 font-mono text-sm">{record.equipment_id?.serial_number || 'N/A'}</td>
                      <td className="py-4 px-6 text-gray-600">{new Date(record.borrow_date).toLocaleDateString('vi-VN')}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(record.expected_return_date).toLocaleDateString('vi-VN')}
                        {record.is_overdue && <span className="ml-2 text-xs text-red-500 font-bold">(Quá hạn)</span>}
                      </td>
                      <td className="py-4 px-6">
                        {record.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3" /> Đang mượn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" /> Đã trả
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {record.status === 'returned' && !record.rating_id && (
                          <button onClick={() => {
                            setRatingTarget({ borrow_record_id: record._id, equipment_id: record.equipment_id?._id, name: record.equipment_id?.name });
                            setRatingVal(5); setComment(''); setShowRatingModal(true);
                          }} className="text-brand-600 hover:text-brand-800 text-sm font-bold flex items-center gap-1">
                            <Star className="w-4 h-4" /> Đánh giá
                          </button>
                        )}
                        {record.status === 'returned' && record.rating_id && (
                          <span className="text-gray-400 text-xs italic">Đã đánh giá</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          reservations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Bạn chưa có lịch đặt nào.</div>
          ) : (
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                    <th className="py-4 px-6 font-semibold">Tên thiết bị</th>
                    <th className="py-4 px-6 font-semibold">Ngày bắt đầu đặt</th>
                    <th className="py-4 px-6 font-semibold">Ngày kết thúc (Khoảng)</th>
                    <th className="py-4 px-6 font-semibold">Trạng thái</th>
                    <th className="py-4 px-6 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map(res => (
                    <tr key={res._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{res.equipment_id?.name || 'N/A'}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(res.startTime).toLocaleDateString('vi-VN')} {new Date(res.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(res.endTime).toLocaleDateString('vi-VN')} {new Date(res.endTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' : res.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {res.status === 'confirmed' ? 'Đã xác nhận' : res.status === 'cancelled' ? 'Đã hủy' : 'Đang chờ'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {res.status !== 'cancelled' && (
                          <button onClick={() => handleCancelReservation(res._id)} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1">
                             <Trash2 className="w-4 h-4" /> Hủy lịch
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showRatingModal && ratingTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Đánh giá thiết bị</h3>
            <p className="text-sm text-gray-500 mb-4">{ratingTarget.name}</p>
            <form onSubmit={handleRate}>
              <div className="mb-4 flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Đánh giá:</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setRatingVal(v)}>
                      <Star className={`w-6 h-6 ${v <= ratingVal ? 'text-brand-500 fill-brand-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                className="w-full border border-gray-300 rounded-xl p-3 text-sm mb-4 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                rows="3" 
                placeholder="Chia sẻ nhận xét của bạn về tình trạng thiết bị..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowRatingModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 hover:bg-brand-700">Gửi Đánh giá</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
