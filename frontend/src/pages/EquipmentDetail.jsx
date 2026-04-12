import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Package, CalendarDays, Info, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Clock, CalendarRange, User, FileText, QrCode, Scan, Upload, ClipboardCheck, CornerDownRight } from 'lucide-react';
import jsQR from 'jsqr';
import { Html5QrcodeScanner } from 'html5-qrcode';

const EquipmentDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { user } = useContext(AuthContext);
   const [equipment, setEquipment] = useState(null);
   const [loading, setLoading] = useState(true);
   const [returnDate, setReturnDate] = useState('');
   const [borrowLoading, setBorrowLoading] = useState(false);
   const [message, setMessage] = useState('');
   const [error, setError] = useState('');
   const [reservations, setReservations] = useState([]);
   const [resStart, setResStart] = useState('');
   const [resEnd, setResEnd] = useState('');
   const [resLoading, setResLoading] = useState(false);
   
   // QR Verification States
   const [isVerified, setIsVerified] = useState(false);
   const [verificationMethod, setVerificationMethod] = useState('scan'); // 'scan', 'upload', 'paste'
   const [verificationError, setVerificationError] = useState(null);
   const [pasteValue, setPasteValue] = useState('');
   const [isVerifying, setIsVerifying] = useState(false);

   const config = {
      headers: { Authorization: `Bearer ${user?.token}` }
   };

   const fetchEquipment = async () => {
      try {
         const { data } = await axios.get(`http://localhost:5000/api/equipment/${id}`, config);
         setEquipment(data);
      } catch (err) {
         setError('Không tìm thấy thiết bị hoặc có lỗi xảy ra.');
      }
   };

   const fetchReservations = async () => {
      try {
         const { data } = await axios.get(`http://localhost:5000/api/reservations/equipment/${id}`, config);
         setReservations(data);
      } catch (e) {
         console.error('Lỗi tải lịch đặt chỗ');
      }
   };

   useEffect(() => {
      setLoading(true);
      const loadAll = async () => {
         await Promise.all([fetchEquipment(), fetchReservations()]);
         setLoading(false);
      };
      loadAll();
   }, [id, user]);

   const handleBorrow = async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (!returnDate) {
         setError('Vui lòng chọn ngày dự kiến trả');
         return;
      }
      setBorrowLoading(true);
      setError('');
      setMessage('');
      try {
         await axios.post('http://localhost:5000/api/borrow', {
            equipment_id: id,
            expected_return_date: returnDate
         }, config);
         setMessage('Mượn thiết bị thành công!');
         fetchEquipment();
      } catch (err) {
         setError(err.response?.data?.message || 'Có lỗi xảy ra khi mượn.');
      }
      setBorrowLoading(false);
   };

   const handleReservation = async (e) => {
      e.preventDefault();
      if (!resStart || !resEnd) return setError('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc');
      setResLoading(true);
      setError('');
      setMessage('');
      try {
         await axios.post('http://localhost:5000/api/reservations', {
            equipment_id: id,
            startTime: resStart,
            endTime: resEnd
         }, config);
         setMessage('Đặt lịch thành công!');
         setResStart('');
         setResEnd('');
         fetchReservations();
      } catch (err) {
         setError(err.response?.data?.message || 'Lỗi khi đặt lịch');
      }
      setResLoading(false);
   };

   // QR Verification Logic
   const handleVerify = (content) => {
      if (!content) return;
      setIsVerifying(true);
      setVerificationError(null);

      // Regex to extract MongoDB ID from URL or raw string
      const match = content.match(/\/equipment\/([a-f\d]{24})/) || content.match(/^([a-f\d]{24})$/);
      const extractedId = match ? match[1] : null;

      if (extractedId === id) {
         setTimeout(() => {
            setIsVerified(true);
            setIsVerifying(false);
            setVerificationError(null);
         }, 800);
      } else {
         setIsVerifying(false);
         setVerificationError('Mã QR không khớp với thiết bị hiện tại. Vui lòng kiểm tra lại!');
      }
   };

   const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         const img = new Image();
         img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
               handleVerify(code.data);
            } else {
               setVerificationError('Không tìm thấy mã QR trong ảnh này. Thử quét trực tiếp hoặc dán mã!');
            }
         };
         img.src = event.target.result;
      };
      reader.readAsDataURL(file);
   };

   useEffect(() => {
      const handleGlobalPaste = (e) => {
         if (isVerified || equipment?.status !== 'available') return;
         const items = e.clipboardData?.items;
         if (!items) return;
         
         for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
               const blob = items[i].getAsFile();
               const reader = new FileReader();
               reader.onload = (event) => {
                  const img = new Image();
                  img.onload = () => {
                     const canvas = document.createElement('canvas');
                     const ctx = canvas.getContext('2d');
                     canvas.width = img.width;
                     canvas.height = img.height;
                     ctx.drawImage(img, 0, 0);
                     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                     const code = jsQR(imageData.data, imageData.width, imageData.height);
                     if (code) {
                        handleVerify(code.data);
                     } else {
                        setVerificationError('Không tìm thấy mã QR trong ảnh vừa dán. Thử lại nhé!');
                     }
                  };
                  img.src = event.target.result;
               };
               reader.readAsDataURL(blob);
               break;
            }
         }
      };

      window.addEventListener('paste', handleGlobalPaste);
      return () => window.removeEventListener('paste', handleGlobalPaste);
   }, [isVerified, equipment, id]);

   useEffect(() => {
      if (verificationMethod === 'scan' && !isVerified && equipment?.status === 'available') {
         const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
         scanner.render((data) => {
            scanner.clear();
            handleVerify(data);
         }, (err) => {
            // Silence noise errors
         });
         return () => scanner.clear();
      }
   }, [verificationMethod, isVerified, equipment]);

   if (loading) return <div className="flex justify-center my-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;
   if (!equipment) return <div className="text-center my-12 text-red-500 font-medium">{error}</div>;

   const StatusBadge = ({ status }) => {
      if (status === 'available') return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> Có sẵn</span>;
      if (status === 'borrowed') return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"><AlertTriangle className="w-4 h-4" /> Đang mượn</span>;
      return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"><XCircle className="w-4 h-4" /> Bảo trì</span>;
   };

   return (
      <div className="max-w-6xl mx-auto py-6 px-4">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors mb-8 font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
         </button>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Info & Status */}
            <div className="lg:col-span-1 space-y-6">
               <div className="glass-card p-8 rounded-3xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 border-white/40">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[40px] rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                     <div className="mb-6">
                        <StatusBadge status={equipment.status} />
                     </div>
                     <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                           <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">
                              {equipment.name}
                           </h1>
                           <p className="text-gray-500 font-mono text-sm mb-4 bg-gray-100 w-max px-3 py-1 rounded-lg">S/N: {equipment.serial_number}</p>
                        </div>
                     </div>

                     <div className="space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                           <Clock size={18} className="text-brand-500" />
                           <span>Lượt mượn: <b className="text-gray-900">{equipment.borrow_count || 0}</b></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                           <Info size={18} className="text-brand-500" />
                           <span>Phòng Lab: <b className="text-gray-900">Lab CNTT</b></span>
                        </div>
                        {equipment.manual_url && (
                           <a
                              href={equipment.manual_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors group/link bg-indigo-50 p-3 rounded-2xl border border-indigo-100 mt-4"
                           >
                              <FileText size={18} className="group-hover/link:scale-110 transition-transform" />
                              <span>Xem tài liệu hướng dẫn</span>
                           </a>
                        )}
                     </div>
                  </div>
               </div>

               {/* Schedule List */}
               <div className="glass-card p-6 rounded-3xl border-gray-100 shadow-sm bg-white/40">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <CalendarRange size={16} /> Lịch đặt chỗ sắp tới
                  </h3>
                  {reservations.length === 0 ? (
                     <p className="text-gray-400 text-sm italic text-center py-4">Chưa có ai đặt chỗ này.</p>
                  ) : (
                     <div className="space-y-4">
                        {reservations.map(res => (
                           <div key={res._id} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                    <User size={12} className="text-indigo-400" /> {res.user_id?.fullname}
                                 </div>
                                 <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md font-black italic">ĐÃ XÁC NHẬN</span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium">
                                 {new Date(res.startTime).toLocaleString('vi-VN')}
                              </p>
                              <div className="text-[10px] text-gray-400 mt-0.5">đến {new Date(res.endTime).toLocaleString('vi-VN')}</div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            {/* Right column: Borrow & Reserve Forms */}
            <div className="lg:col-span-2 space-y-6">
               {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3 animate-shake font-medium text-sm"><XCircle size={18} className="mt-0.5" /> {error}</div>}
               {message && <div className="p-4 bg-green-50 text-green-600 rounded-2xl border border-green-100 flex items-start gap-3 animate-fade-in font-medium text-sm"><CheckCircle2 size={18} className="mt-0.5" /> {message}</div>}

               {/* Borrow Now Section */}
               <div id="borrow-section" className={`p-8 rounded-[32px] border transition-all duration-500 ${equipment.status === 'available' ? (isVerified ? 'bg-brand-600 border-brand-500 shadow-2xl' : 'bg-white border-gray-200 shadow-xl') : 'bg-gray-100 text-gray-400 border-gray-200 opacity-80'}`}>
                  <div className="flex items-center justify-between mb-8">
                     <h2 className={`text-xl font-black flex items-center gap-3 ${equipment.status === 'available' && isVerified ? 'text-white' : 'text-gray-900'}`}>
                        <Package size={24} className={isVerified ? 'text-white' : 'text-brand-500'} /> 
                        {isVerified ? 'Phiếu mượn đã sẵn sàng' : 'Mượn thiết bị ngay'}
                     </h2>
                     {equipment.status === 'available' && (
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border-2 ${isVerified ? 'bg-white text-brand-600 border-white' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                           {isVerified ? 'ĐÃ XÁC THỰC VỊ TRÍ' : 'CHỜ XÁC THỰC QR'}
                        </div>
                     )}
                  </div>

                  {equipment.status === 'available' ? (
                     !isVerified ? (
                        <div className="space-y-6">
                           <div className="bg-brand-50 border border-brand-100 p-5 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                 <div className="bg-brand-500 p-2 rounded-xl text-white shrink-0 shadow-lg shadow-brand-500/20">
                                    <QrCode size={20} />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-sm font-bold text-brand-900">Yêu cầu xác nhận thiết bị</p>
                                    <p className="text-xs text-brand-600 leading-relaxed text-wrap">Để đảm bảo bạn đang ở đúng vị trí thiết bị, hãy quét mã QR vật lý dán trên máy.</p>
                                 </div>
                              </div>
                              
                              {/* Bigger QR Code for better visibility/scanning */}
                              <div className="bg-white p-3 rounded-2xl shadow-sm border border-brand-100 shrink-0 group relative cursor-help">
                                 <img 
                                    src={equipment.qr_code_url} 
                                    alt="Physical Tag" 
                                    className="w-32 h-32 object-contain opacity-90 group-hover:opacity-100 transition-all"
                                 />
                                 <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                                    <QrCode size={16} />
                                 </div>
                              </div>
                           </div>

                           {/* Tabs */}
                           <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-1">
                              {[
                                 { id: 'scan', label: 'Quét Camera', icon: <Scan size={16} /> },
                                 { id: 'upload', label: 'Tải ảnh lên', icon: <Upload size={16} /> },
                                 { id: 'paste', label: 'Dán mã/link', icon: <ClipboardCheck size={16} /> }
                              ].map(tab => (
                                 <button
                                    key={tab.id}
                                    onClick={() => { setVerificationMethod(tab.id); setVerificationError(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${verificationMethod === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                 >
                                    {tab.icon} {tab.label}
                                 </button>
                              ))}
                           </div>

                           {/* Verification Content */}
                           <div className="min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-6 bg-gray-50/50 transition-all">
                              {verificationError && (
                                 <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center gap-3 text-center animate-in fade-in slide-in-from-top-2">
                                    <AlertTriangle className="text-red-500" size={24} />
                                    <p className="text-xs font-bold text-red-600">{verificationError}</p>
                                    <button 
                                       onClick={() => setVerificationError(null)}
                                       className="text-[10px] uppercase font-black tracking-widest text-red-500 hover:underline"
                                    >
                                       Thử lại ngay
                                    </button>
                                 </div>
                              )}

                              {isVerifying ? (
                                 <div className="flex flex-col items-center gap-4 py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                                    <p className="text-xs font-bold text-gray-500 animate-pulse">ĐANG PHÂN TÍCH MÃ QR...</p>
                                 </div>
                              ) : (
                                 <>
                                    {verificationMethod === 'scan' && (
                                       <div id="reader" className="w-full max-w-[280px] overflow-hidden rounded-2xl shadow-inner bg-black"></div>
                                    )}

                                    {verificationMethod === 'upload' && (
                                       <label className="w-full flex flex-col items-center gap-4 cursor-pointer group">
                                          <div className="bg-white p-6 rounded-full border-2 border-gray-100 text-gray-300 group-hover:text-brand-500 group-hover:border-brand-200 transition-all shadow-sm">
                                             <Upload size={32} />
                                          </div>
                                          <span className="text-sm font-bold text-gray-400 group-hover:text-gray-600">Bấm để duyệt ảnh thiết bị</span>
                                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                       </label>
                                    )}

                                    {verificationMethod === 'paste' && (
                                       <div className="w-full space-y-4">
                                          <div className="relative">
                                             <input 
                                                type="text" 
                                                value={pasteValue}
                                                onChange={e => setPasteValue(e.target.value)}
                                                placeholder="Link hoặc ID thiết bị..."
                                                className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-sm font-bold outline-none focus:border-brand-500 transition-all pr-12"
                                             />
                                             <ClipboardCheck size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                          </div>
                                          <button 
                                             onClick={() => handleVerify(pasteValue)}
                                             className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                                          >
                                             Kiểm tra mã <CornerDownRight size={18} />
                                          </button>
                                       </div>
                                    )}
                                 </>
                              )}
                           </div>
                        </div>
                     ) : (
                        /* Borrow Form with Fade-in animation */
                        <form onSubmit={handleBorrow} className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 animate-in fade-in zoom-in duration-700">
                           <div className="md:col-span-2 space-y-1.5">
                              <label className="text-xs font-black uppercase tracking-wider opacity-80 text-white/80">Ngày dự kiến trả</label>
                              <input
                                 type="date"
                                 value={returnDate}
                                 onChange={e => setReturnDate(e.target.value)}
                                 min={new Date().toISOString().split("T")[0]}
                                 className="w-full bg-white/20 border-white/20 rounded-2xl p-4 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 border outline-none font-bold backdrop-blur-sm shadow-inner"
                              />
                           </div>
                           <button 
                              type="submit" 
                              disabled={borrowLoading} 
                              className="bg-white text-brand-600 hover:bg-gray-100 py-4 px-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 h-[58px] text-sm"
                           >
                              {borrowLoading ? '...' : 'GỬI PHIẾU' }
                           </button>
                           {/* Mượn nhanh button next to submit */}
                           <button 
                              type="button"
                              onClick={() => {
                                 const threeDaysLater = new Date();
                                 threeDaysLater.setDate(threeDaysLater.getDate() + 3);
                                 setReturnDate(threeDaysLater.toISOString().split('T')[0]);
                                 // Trigger borrow logic directly after state update
                                 setTimeout(() => {
                                    handleBorrow({ preventDefault: () => {} });
                                 }, 100);
                              }}
                              disabled={borrowLoading} 
                              className="bg-brand-400 text-white hover:bg-brand-300 py-4 px-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 h-[58px] text-sm flex items-center justify-center gap-2"
                           >
                              {borrowLoading ? '...' : 'MƯỢN NHANH'}
                           </button>
                        </form>
                     )
                  ) : (
                     <div className="flex items-center gap-4 py-4">
                        <div className="bg-gray-200/50 p-3 rounded-full text-gray-400"><XCircle size={24} /></div>
                        <p className="font-bold text-gray-500 text-sm">Thiết bị hiện đang bận hoặc đang bảo trì, không thể mượn ngay.</p>
                     </div>
                  )}
               </div>

               {/* Reservation Section - Only show when verified */}
               {isVerified && (
                  <div className="glass-card p-8 rounded-[32px] border-white/60 bg-white/50 animate-in fade-in zoom-in duration-1000 delay-200">
                     <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <CalendarDays size={24} className="text-indigo-600" /> Đặt lịch cho tương lai
                     </h2>
                     <form onSubmit={handleReservation} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Thời gian bắt đầu</label>
                              <input
                                 type="datetime-local"
                                 value={resStart}
                                 onChange={e => setResStart(e.target.value)}
                                 className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-indigo-500 border outline-none font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Thời gian kết thúc</label>
                              <input
                                 type="datetime-local"
                                 value={resEnd}
                                 onChange={e => setResEnd(e.target.value)}
                                 className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-indigo-500 border outline-none font-bold"
                              />
                           </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-gray-100">
                           <p className="text-xs text-gray-500 italic max-w-sm">Hệ thống sẽ tự động xác nhận lịch đặt nếu không trùng với bất kỳ ai khác.</p>
                           <button type="submit" disabled={resLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-10 rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
                              {resLoading ? 'ĐANG LƯU...' : 'ĐẶT CHỖ NGAY'}
                           </button>
                        </div>
                     </form>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default EquipmentDetail;
