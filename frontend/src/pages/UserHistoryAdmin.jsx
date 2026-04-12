import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, ArrowLeft, Clock, Search, History, User } from 'lucide-react';

const UserHistoryAdmin = () => {
   const { userId } = useParams();
   const navigate = useNavigate();
   const { user } = useContext(AuthContext);
   const [userData, setUserData] = useState(null);
   const [history, setHistory] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');

   const config = {
      headers: { Authorization: `Bearer ${user?.token}` }
   };

   const fetchUserHistory = async () => {
      try {
         const { data } = await axios.get(`http://localhost:5000/api/borrow/user/${userId}`, config);
         setUserData(data.user);
         setHistory(data.records);
         setLoading(false);
      } catch (error) {
         console.error('Lỗi khi lấy lịch sử người dùng:', error);
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchUserHistory();
   }, [userId]);

   const handleReturn = async (borrowId) => {
      if (!window.confirm('Bạn có chắc chắn muốn xác nhận trả thiết bị này không?')) return;
      try {
         await axios.put(`http://localhost:5000/api/borrow/${borrowId}/return`, {}, config);
         alert('Xác nhận trả thành công!');
         fetchUserHistory();
      } catch (error) {
         alert('Lỗi xác nhận: ' + (error.response?.data?.message || error.message));
      }
   };

   if (loading) return (
      <div className="flex justify-center my-12">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
   );

   if (!userData) return (
      <div className="text-center my-12 text-red-500 font-medium">
         Không tìm thấy dữ liệu người dùng.
      </div>
   );

   const activeBorrows = history.filter(h => h.status === 'active');
   const returnedBorrows = history.filter(h => h.status === 'returned');

   // Lọc theo từ khóa (tên thiết bị hoặc SN)
   const filteredHistory = history.filter(h => {
      if (!h.equipment_id) return false;
      const term = searchTerm.toLowerCase();
      return h.equipment_id.name.toLowerCase().includes(term) || h.equipment_id.serial_number.toLowerCase().includes(term);
   });

   const filteredActive = filteredHistory.filter(h => h.status === 'active');
   const filteredReturned = filteredHistory.filter(h => h.status === 'returned');

   return (
      <div className="max-w-6xl mx-auto py-6 px-4">
         {/* Navigation & Header */}
         <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay lại Quản lý Sinh viên
         </button>

         <div className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
               <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 shadow-sm border border-brand-200">
                  <User size={32} />
               </div>
               <div>
                  <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                     Lịch sử của {userData.fullname}
                  </h1>
                  <p className="text-gray-500 font-mono text-sm mt-1 flex items-center gap-2">
                     <span className="bg-gray-100 px-3 py-1 rounded-md text-gray-700 font-bold">Mã: {userData.student_id}</span>
                     {userData.isLocked && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-bold uppercase">Bị Khóa</span>}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Đang giữ</p>
                  <p className="text-xl font-black text-orange-700">{activeBorrows.length} thiết bị</p>
               </div>
               <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Đã trả</p>
                  <p className="text-xl font-black text-green-700">{returnedBorrows.length} thiết bị</p>
               </div>
               <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 md:col-span-2">
                  <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Tổng lượt mượn</p>
                  <p className="text-xl font-black text-brand-700">{history.length} lượt</p>
               </div>
            </div>
         </div>

         {/* Search Filter */}
         <div className="relative max-w-md mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
               type="text" 
               placeholder="Tìm theo tên thiết bị hoặc số serial..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm outline-none transition-all shadow-sm font-medium bg-white/50"
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Borrows */}
            <div>
               <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" /> Thiết bị đang mượn ({filteredActive.length})
               </h3>
               {filteredActive.length === 0 ? (
                  <div className="bg-gray-50/50 rounded-2xl p-8 text-center text-gray-400 italic font-medium border border-gray-100 border-dashed">
                     Không có thiết bị mục này
                  </div>
               ) : (
                  <div className="space-y-4">
                     {filteredActive.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm shadow-orange-100/50 hover:shadow-md transition-all">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900 text-base">{item.equipment_id?.name || 'Thiết bị không tồn tại'}</h4>
                              <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">Đang mượn</span>
                           </div>
                           <p className="text-xs text-gray-500 font-mono font-medium mb-4 bg-gray-50 inline-block px-2 py-1 rounded-md">SN: {item.equipment_id?.serial_number}</p>
                           
                           <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-100 py-3 mb-3">
                              <div>
                                 <p className="text-gray-400 font-bold mb-0.5">NGÀY MƯỢN</p>
                                 <p className="font-medium text-gray-700">{new Date(item.borrow_date).toLocaleString('vi-VN')}</p>
                              </div>
                              <div>
                                 <p className="text-gray-400 font-bold mb-0.5">HẠN TRẢ</p>
                                 <p className="font-medium text-red-500">{new Date(item.expected_return_date).toLocaleString('vi-VN')}</p>
                              </div>
                           </div>
                           
                           <button 
                              onClick={() => handleReturn(item._id)}
                              className="w-full bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold py-2.5 rounded-xl transition-colors border border-brand-200 text-sm flex items-center justify-center gap-2"
                           >
                              <CheckCircle2 size={16} /> Xác nhận trả
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Returned Borrows */}
            <div>
               <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                  <History className="text-brand-500" /> Lịch sử đã trả ({filteredReturned.length})
               </h3>
               {filteredReturned.length === 0 ? (
                  <div className="bg-gray-50/50 rounded-2xl p-8 text-center text-gray-400 italic font-medium border border-gray-100 border-dashed">
                     Không có dữ liệu
                  </div>
               ) : (
                  <div className="space-y-4">
                     {filteredReturned.map((item) => (
                        <div key={item._id} className="bg-white/80 rounded-2xl p-5 border border-gray-100 hover:border-gray-300 hover:bg-white transition-all">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-700 text-base">{item.equipment_id?.name || 'Thiết bị'}</h4>
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">Đã trả</span>
                           </div>
                           <p className="text-xs text-gray-400 font-mono font-medium mb-3">SN: {item.equipment_id?.serial_number}</p>
                           
                           <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                 <p className="text-gray-400 font-bold uppercase">Ngày mượn</p>
                                 <p className="text-gray-600 font-medium">{new Date(item.borrow_date).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <div>
                                 <p className="text-green-500 font-bold uppercase">Ngày trả</p>
                                 <p className="text-green-600 font-medium">{item.actual_return_date ? new Date(item.actual_return_date).toLocaleDateString('vi-VN') : '-'}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default UserHistoryAdmin;
