import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingCart, HeartOff, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { toggleWishlist, reload } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/wishlist', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setItems(data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user.token]);

  const handleRemove = async (id) => {
    await toggleWishlist(id);
    setItems(items.filter(item => item._id !== id));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải danh sách yêu thích...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
          <HeartOff className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
          <p className="text-gray-500 text-sm">Những thiết bị bạn đã lưu lại để mượn sau</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center">
          <PackageOpen size={48} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có thiết bị nào</h3>
          <p className="text-gray-500 mb-6">Bạn chưa thêm thiết bị nào vào danh sách yêu thích.</p>
          <Link to="/catalog" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">
            Khám phá thiết bị
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((eq) => (
            <div key={eq._id} className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{eq.name}</h3>
                  <span className="text-sm text-gray-500">SN: {eq.serial_number}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex gap-2">
                <button
                  onClick={() => addToCart(eq)}
                  disabled={eq.status !== 'available' || isInCart(eq._id)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    eq.status === 'available' && !isInCart(eq._id)
                      ? 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={16} />
                  {isInCart(eq._id) ? 'Đã trong giỏ' : 'Thêm vào giỏ'}
                </button>
                <button
                  onClick={() => handleRemove(eq._id)}
                  className="p-2 border-2 border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Bỏ yêu thích"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
