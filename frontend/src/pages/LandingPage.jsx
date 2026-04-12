import { Link, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { QrCode, ShieldCheck, Zap, ArrowRight, MonitorPlay } from 'lucide-react';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/scan" />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 bg-[#0a0a0f] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10 py-20 pb-16">
        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-8 flex items-center gap-2">
          <Zap size={16} /> Phiên bản Lab Manager 2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-blue-100 to-gray-500 bg-clip-text text-transparent leading-tight">
          Quản Lý Thiết Bị <br className="hidden md:block"/> Thông Minh Bằng Mã QR
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Hệ thống mượn trả thiết bị được thiết kế tối ưu, giúp sinh viên và quản trị viên tiết kiệm thời gian thông qua ứng dụng quét QR tức thời.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/login" className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 text-lg">
            Đăng Nhập Hệ Thống <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Feature Steps */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#15161a] border border-white/5 p-8 rounded-3xl hover:bg-[#1a1b20] transition-colors group">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <QrCode size={28} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">1. Quét Mã Nhanh Chóng</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Chỉ cần đưa điện thoại vào tem mã vạch dán trên thiết bị, ứng dụng sẽ ngay lập tức nhận diện loại linh kiện.
          </p>
        </div>

        <div className="bg-[#15161a] border border-white/5 p-8 rounded-3xl hover:bg-[#1a1b20] transition-colors group">
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <ShieldCheck size={28} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">2. Quy Trình Bảo Mật</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Tất cả thiết bị đều được quản lý bằng tài khoản sinh viên chính danh để đảm bảo tính minh bạch.
          </p>
        </div>

        <div className="bg-[#15161a] border border-white/5 p-8 rounded-3xl hover:bg-[#1a1b20] transition-colors group">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <MonitorPlay size={28} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">3. Quản Trị Trực Quan</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Admin theo dõi được mọi số liệu mượn trả, thiết bị quá hạn, cũng như biểu đồ hoạt động realtime.
          </p>
        </div>

      </div>

    </div>
  );
};

export default LandingPage;
