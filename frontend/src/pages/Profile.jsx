import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, ShieldCheck, Key, LogOut, Package, History, Award, CheckCircle2, CalendarRange, Trash2, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [myReservations, setMyReservations] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
      setProfileData(data);
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ');
    }
  };

  const fetchMyReservations = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/reservations/my', config);
      setMyReservations(data);
    } catch (error) {
      console.error('Lỗi tải lịch đặt chỗ');
    }
  };

  useEffect(() => {
    setLoading(true);
    const loadAll = async () => {
      await Promise.all([fetchProfile(), fetchMyReservations()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch đặt này?')) return;
    try {
      await axios.put(`http://localhost:5000/api/reservations/${id}/cancel`, {}, config);
      fetchMyReservations();
    } catch (error) {
      alert('Không thể hủy lịch đặt này');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      return setPasswordError('Mật khẩu xác nhận không khớp');
    }

    try {
      await axios.put('http://localhost:5000/api/users/update-password', {
        currentPassword,
        newPassword
      }, config);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
         
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
               <User size={64} />
            </div>
            
            <div className="text-center md:text-left flex-1">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-extrabold text-gray-900">{profileData?.fullname}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-brand-100 text-brand-700 border-brand-200'
                  }`}>
                    {user.role}
                  </span>
               </div>
               <p className="text-gray-500 font-mono text-lg mb-4">MSSV: {profileData?.student_id}</p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-100">
                     <ShieldCheck size={18} className="text-green-500" />
                     <span className="text-sm font-medium text-gray-700">Tài khoản đã xác thực</span>
                  </div>
               </div>
            </div>

             <div className="grid grid-cols-3 gap-4 w-full md:w-auto mt-4">
                <div className="glass-card bg-brand-50/50 p-4 rounded-2xl border-brand-100 text-center flex flex-col items-center justify-center">
                   <Award className="text-brand-500 mb-1" size={20} />
                   <p className="text-2xl font-black text-brand-900 leading-none">{profileData?.stats?.total || 0}</p>
                   <p className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter mt-1">Tổng mượn</p>
                </div>
                <div className="glass-card bg-indigo-50/50 p-4 rounded-2xl border-indigo-100 text-center flex flex-col items-center justify-center">
                   <Package className="text-indigo-500 mb-1" size={20} />
                   <p className="text-2xl font-black text-indigo-900 leading-none">{profileData?.stats?.active || 0}</p>
                   <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mt-1">Đang mượn</p>
                </div>
                <div className="glass-card bg-green-50/50 p-4 rounded-2xl border-green-100 text-center flex flex-col items-center justify-center">
                   <ShieldCheck className="text-green-500 mb-1" size={20} />
                   <p className="text-2xl font-black text-green-900 leading-none">{profileData?.trust_score || 100}</p>
                   <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter mt-1">Điểm uy tín</p>
                </div>
             </div>
         </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {/* Left Column: Profile Info & Medals */}
         <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-3xl">
               <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-brand-500" /> Thành tích Lab
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                     <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                        <Award size={20} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-800">Thành viên tích cực</p>
                        <p className="text-[11px] text-gray-500">Mượn thiết bị trên 10 lần</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 group opacity-50 grayscale">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <History size={20} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-800">Người mượn uy tín</p>
                        <p className="text-[11px] text-gray-500">Không quá hạn trong 3 tháng</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="glass-card p-6 rounded-3xl">
               <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CalendarRange size={20} className="text-indigo-500" /> Lịch đặt của tôi
               </h3>
               {myReservations.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">Bạn chưa có lịch đặt nào.</p>
               ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     {myReservations.map(res => (
                        <div key={res._id} className={`p-4 rounded-2xl border ${res.status === 'cancelled' ? 'bg-gray-50 opacity-60 border-gray-100' : 'bg-white border-indigo-50 shadow-sm'}`}>
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate max-w-[120px]">{res.equipment_id?.name}</h4>
                              {res.status !== 'cancelled' && (
                                 <button 
                                   onClick={() => handleCancelReservation(res._id)}
                                   className="text-gray-400 hover:text-red-500 transition-colors"
                                   title="Hủy lịch"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              )}
                           </div>
                           <p className="text-[10px] font-mono text-gray-500 mb-1 leading-none">S/N: {res.equipment_id?.serial_number}</p>
                           <div className="text-[10px] font-bold text-indigo-600 pt-1">
                              {new Date(res.startTime).toLocaleDateString('vi-VN')} {new Date(res.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                           <div className="text-[9px] text-gray-400 mt-1 uppercase font-black tracking-widest">
                               {res.status === 'confirmed' ? 'Đã xác nhận' : 
                                res.status === 'pending' ? 'Đang chờ' : 
                                res.status === 'cancelled' ? 'Đã hủy' : res.status}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-3xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 group"
            >
               <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Đăng xuất tài khoản
            </button>
         </div>

         {/* Right Column: Security/Settings */}
         <div className="md:col-span-2">
            <div className="glass-card p-8 rounded-3xl h-full">
               <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <Key size={20} className="text-brand-500" /> Bảo mật & Đổi mật khẩu
               </h3>

               <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                  {passwordError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-shake">
                       ⚠️ {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-medium border border-green-100 animate-fade-in">
                       ✅ {passwordSuccess}
                    </div>
                  )}

                  <div className="space-y-1.5">
                     <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu hiện tại</label>
                     <div className="relative">
                        <input 
                          type={showCurrentPassword ? "text" : "password"} 
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full px-4 pr-11 py-3 rounded-xl border-gray-200 focus:ring-brand-500 focus:border-transparent bg-gray-50/50"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu mới</label>
                        <div className="relative">
                           <input 
                             type={showNewPassword ? "text" : "password"} 
                             value={newPassword}
                             onChange={e => setNewPassword(e.target.value)}
                             className="w-full px-4 pr-11 py-3 rounded-xl border-gray-200 focus:ring-brand-500 focus:border-transparent bg-gray-50/50"
                             placeholder="••••••••"
                             required
                           />
                           <button
                             type="button"
                             onClick={() => setShowNewPassword(!showNewPassword)}
                             className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                           >
                             {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Xác nhận mật khẩu</label>
                        <div className="relative">
                           <input 
                             type={showConfirmPassword ? "text" : "password"} 
                             value={confirmPassword}
                             onChange={e => setConfirmPassword(e.target.value)}
                             className="w-full px-4 pr-11 py-3 rounded-xl border-gray-200 focus:ring-brand-500 focus:border-transparent bg-gray-50/50"
                             placeholder="••••••••"
                             required
                           />
                           <button
                             type="button"
                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                             className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                           >
                             {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4">
                     <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-500/20">
                        Cập nhật mật khẩu
                     </button>
                  </div>
               </form>

               <div className="mt-12 pt-8 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Quyền hạn truy cập</h4>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold">
                     {user.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'SINH VIÊN'}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Profile;
