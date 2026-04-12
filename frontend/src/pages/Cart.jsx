import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, Calendar, CheckCircle, AlertTriangle, PackageOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [returnDate, setReturnDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBulkBorrow = async (e) => {
    e.preventDefault();
    if (!returnDate) {
      setError('Vui lòng chọn ngày trả dự kiến');
      return;
    }

    const expectedDate = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expectedDate < today) {
      setError('Ngày trả dự kiến không thể trong quá khứ');
      return;
    }
    
    // Check if return date is more than 30 days
    const diffTime = Math.abs(expectedDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays > 30) {
      setError('Thời gian mượn tối đa là 30 ngày');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const equipment_ids = cartItems.map(item => item._id);
      await axios.post('http://localhost:5000/api/borrow/bulk', 
        { equipment_ids, expected_return_date: expectedDate.toISOString() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      clearCart();
      alert('Đã tạo đề nghị mượn thiết bị thành công!');
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đề nghị mượn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-100 text-brand-600 rounded-xl">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giỏ mượn thiết bị</h1>
          <p className="text-gray-500 text-sm">Xác nhận thông tin các thiết bị bạn muốn mượn cùng lúc</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center">
          <PackageOpen size={48} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Giỏ mượn trống</h3>
          <p className="text-gray-500 mb-6">Bạn chưa chọn thiết bị nào. Hãy quay lại danh sách để thêm thiết bị.</p>
          <Link to="/catalog" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">
            Khám phá thiết bị
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800">Danh sách đã chọn ({cartItems.length})</h2>
                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
              <ul className="divide-y divide-gray-50">
                {cartItems.map((item) => (
                  <li key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">SN: {item.serial_number}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <form onSubmit={handleBulkBorrow} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-brand-500" />
                Thông tin mượn
              </h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ngày trả dự kiến *
                  </label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border whitespace-nowrap border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm"
                  />
                  <p className="text-xs text-brand-600 mt-1 mt-2 font-medium">Tối đa 30 ngày kể từ hôm nay</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Xác nhận mượn
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
