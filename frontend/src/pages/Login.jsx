import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { QrCode, Lock, User, ArrowRight, Zap, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);
    
    const res = await login(studentId, password);
    if (!res.success) {
      setError(res.message);
    } else {
      // Redirect based on role
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/catalog');
      }
    }
    setLoadingLocal(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 bg-[#0f111a] text-white flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-600/30 blur-[130px] rounded-full mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#151822]/80 backdrop-blur-2xl border border-white/5 z-10 mx-4">
        
        {/* Left Side: Branding / Visuals */}
        <div className="hidden md:flex flex-col p-12 justify-between relative bg-gradient-to-br from-brand-900/40 to-[#0f111a]">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
           
           <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold mb-6 tracking-wider">
                 <Zap size={14} /> HIỆU SUẤT CAO
              </div>
              <h1 className="text-4xl font-extrabold leading-tight mb-4 text-white drop-shadow-md">
                Cổng Kết Nối <br/> Lab Equipment
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Hệ thống quản lý vật tư và thiết bị phòng thí nghiệm ứng dụng công nghệ quét mã QR, giúp quá trình mượn trả diễn ra chưa tới 3 giây.
              </p>
           </div>
           
           <div className="relative z-10 flex items-center gap-4 mt-12 bg-white/5 p-4 py-3 rounded-2xl border border-white/10 backdrop-blur-sm w-max">
              <div className="bg-brand-500 p-2.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                 <QrCode size={24} className="text-white" />
              </div>
              <div>
                 <p className="text-xs text-gray-400 font-medium">Bảo mật đa tầng</p>
                 <p className="text-sm font-bold text-white">Quét QR Tracking</p>
              </div>
           </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center relative">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-6 transition-colors self-start w-max bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10">
             <ArrowLeft size={18} /> Quay lại trang chủ
          </Link>
          
          <div className="md:hidden flex justify-center mb-8">
             <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20">
                <QrCode size={40} className="text-brand-400" />
             </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Chào mừng trở lại! 👋</h2>
          <p className="text-gray-400 text-sm mb-8">Vui lòng đăng nhập bằng tài khoản Sinh viên / MSNV của bạn.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20 flex items-start gap-3 backdrop-blur-sm animate-fade-in">
                <span className="text-red-500 mt-0.5">⚠️</span> 
                <p className="flex-1 font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-1.5 group">
              <label className="text-sm font-semibold text-gray-300 block ml-1 group-focus-within:text-brand-400 transition-colors">Tài khoản (MSSV)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="pl-12 block w-full rounded-xl border border-white/10 bg-[#1f222e] py-3.5 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-gray-600 font-medium outline-none"
                  placeholder="Nhập mã số..."
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 group">
              <label className="text-sm font-semibold text-gray-300 block ml-1 group-focus-within:text-brand-400 transition-colors">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-11 block w-full rounded-xl border border-white/10 bg-[#1f222e] py-3.5 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-gray-600 font-medium outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loadingLocal}
                className={`w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-[15px] font-bold text-white transition-all
                  ${loadingLocal ? 'bg-brand-500/50 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_-10px_rgba(37,99,235,0.6)]'}`}
              >
                {loadingLocal ? 'Đang xác thực...' : (
                   <>Khởi động Hệ thống <ArrowRight size={18} /></>
                )}
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-6 pt-6 border-t border-white/5">
               Tài liệu mượn trả &copy; 2026 PTN Công nghệ
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
