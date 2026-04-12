import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { QrCode, LogOut, Home, User as UserIcon, Bell } from 'lucide-react';
import { ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  if (!user) return null;

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-brand-600 flex items-center gap-2">
                <QrCode className="h-6 w-6" /> LabHub
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'admin' ? (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                <Link to="/admin/analytics" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors font-bold">Thống kê</Link>
                <Link to="/catalog" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Thiết bị</Link>
                <div className="relative group">
                  <button className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                    Nghiệp vụ <span className="ml-1 text-xs">▼</span>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                       <Link to="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">QL Sinh viên</Link>
                       <Link to="/admin/categories" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">QL Danh Mục</Link>
                       <Link to="/admin/labs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">QL Phòng Lab</Link>
                       <Link to="/admin/fines" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">QL Phạt / Đền bù</Link>
                       <Link to="/admin/feedbacks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Đánh giá thiết bị</Link>
                       <Link to="/history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Lịch sử thiết bị</Link>
                       <Link to="/admin/audit-logs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Nhật ký Hệ thống</Link>
                       <Link to="/admin/print-qr" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">In mã QR</Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/catalog" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Thiết bị</Link>
                <Link to="/history" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Lịch sử mượn</Link>
              </>
            )}
            
            <Link to="/scan" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md shadow-brand-500/30 flex items-center gap-1">
              <QrCode className="h-4 w-4" /> Quét QR
            </Link>

             <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                <Link to="/wishlist" className="relative text-gray-500 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50" title="Danh sách yêu thích">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center transform scale-110 border border-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                
                <Link to="/cart" className="relative text-gray-500 hover:text-brand-600 transition-colors p-2 rounded-full hover:bg-brand-50" title="Giỏ mượn thiết bị">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center transform scale-110 border border-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <NotificationBell />
                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-brand-600 transition-colors group p-1.5 rounded-xl hover:bg-brand-50" title="Xem hồ sơ cá nhân">
                   <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                      <UserIcon size={16} />
                   </div>
                   <span className="text-sm font-bold hidden sm:block">{user.fullname}</span>
                </Link>
               <button 
                 onClick={() => setShowLogoutConfirm(true)} 
                 className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                 title="Đăng xuất"
               >
                 <LogOut className="h-5 w-5" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng xuất?</h3>
              <p className="text-gray-500 mb-8">Bạn có chắc chắn muốn thoát khỏi hệ thống không?</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
