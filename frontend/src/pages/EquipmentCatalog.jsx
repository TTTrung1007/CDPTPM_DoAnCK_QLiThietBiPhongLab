import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MonitorPlay, Search, PackageCheck, Clock, Wrench, QrCode, ChevronRight, Filter, Activity, Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const statusConfig = {
  available: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  borrowed:  { label: 'Đang mượn', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  maintenance:{ label: 'Bảo trì',  color: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500' },
};

const EquipmentCatalog = () => {
  const { user } = useContext(AuthContext);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const [borrowLoading, setBorrowLoading] = useState(false);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/equipment', config);
        setEquipments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipments();
  }, []);

  const filtered = equipments.filter(eq => {
    const matchSearch = eq.name.toLowerCase().includes(search.toLowerCase()) ||
                        eq.serial_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || eq.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: equipments.length,
    available: equipments.filter(e => e.status === 'available').length,
    borrowed:  equipments.filter(e => e.status === 'borrowed').length,
    maintenance: equipments.filter(e => e.status === 'maintenance').length,
  };

  const toggleSelect = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkBorrow = async (e) => {
    e.preventDefault();
    if (!returnDate) return alert('Vui lòng chọn ngày trả');
    setBorrowLoading(true);
    try {
      await axios.post('http://localhost:5000/api/borrow/bulk', {
        equipment_ids: selectedIds,
        expected_return_date: returnDate
      }, config);
      alert('Đã đăng ký mượn thành công các thiết bị đã chọn!');
      setSelectedIds([]);
      setShowBorrowModal(false);
      // Reload data
      const { data } = await axios.get('http://localhost:5000/api/equipment', config);
      setEquipments(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi mượn hàng loạt');
    } finally {
      setBorrowLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-brand-600 p-3 rounded-xl shadow-lg shadow-brand-600/20">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thiết Bị Phòng Lab</h1>
            <p className="text-sm text-gray-500">Danh sách thiết bị đang có tại phòng thí nghiệm</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng thiết bị', value: counts.total, icon: <MonitorPlay size={20} className="text-gray-500"/>, bg: 'bg-white', border: 'border-gray-200' },
          { label: 'Sẵn sàng mượn', value: counts.available, icon: <PackageCheck size={20} className="text-green-500"/>, bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Đang được mượn', value: counts.borrowed, icon: <Clock size={20} className="text-yellow-500"/>, bg: 'bg-yellow-50', border: 'border-yellow-200' },
          { label: 'Đang bảo trì', value: counts.maintenance, icon: <Wrench size={20} className="text-red-500"/>, bg: 'bg-red-50', border: 'border-red-200' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5 flex flex-col gap-2 shadow-sm`}>
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-500">{s.label}</p>
              {s.icon}
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên thiết bị hoặc Serial..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'available', label: '✅ Sẵn sàng' },
            { key: 'borrowed', label: '🟡 Đang mượn' },
            { key: 'maintenance', label: '🔴 Bảo trì' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all whitespace-nowrap
                ${filterStatus === f.key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MonitorPlay size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Không tìm thấy thiết bị nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(eq => {
            const st = statusConfig[eq.status] || statusConfig.available;
            return (
              <Link
                to={`/equipment/${eq._id}`}
                key={eq._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-300 hover:-translate-y-1 transition-all duration-200 overflow-hidden group flex flex-col"
              >
                {/* Image/Illustration area */}
                <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-brand-50 group-hover:to-blue-50 transition-colors relative p-6">
                  {eq.status === 'available' && (
                    <div 
                      onClick={(e) => toggleSelect(e, eq._id)}
                      className={`absolute top-3 left-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all z-10 cursor-pointer
                        ${selectedIds.includes(eq._id) ? 'bg-brand-600 border-brand-600 shadow-lg shadow-brand-500/20' : 'bg-white/80 border-gray-300 hover:border-brand-400'}`}
                    >
                      {selectedIds.includes(eq._id) && <PackageCheck size={14} className="text-white" />}
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(eq._id); }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-sm ${isWishlisted(eq._id) ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-white/80 text-gray-400 border-gray-200 hover:bg-rose-50 hover:text-rose-400'}`}
                    >
                      <Heart size={16} fill={isWishlisted(eq._id) ? "currentColor" : "none"} />
                    </button>
                    {eq.status === 'available' && (
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(eq); }}
                        disabled={isInCart(eq._id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow-sm ${isInCart(eq._id) ? 'bg-brand-500 text-white border-brand-500 cursor-not-allowed' : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-brand-50 hover:text-brand-600 cursor-pointer'}`}
                        title={isInCart(eq._id) ? "Đã trong giỏ mượn" : "Thêm vào giỏ mượn"}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    )}
                  </div>
                  
                  {eq.image_url ? (
                    <img 
                      src={eq.image_url} 
                      alt={eq.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-brand-300 transition-colors">
                      <MonitorPlay size={64} strokeWidth={1.5} />
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">No Illustration</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{eq.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">SN: {eq.serial_number}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Activity size={12} className="text-brand-500" />
                    <span className="text-[11px] text-gray-500 font-medium">{eq.borrow_count || 0} lượt mượn</span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    {eq.status === 'available' ? (
                      <span className="text-xs font-semibold text-brand-600">Có thể mượn ngay →</span>
                    ) : (
                      <span className="text-xs text-gray-400">Hiện không khả dụng</span>
                    )}
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Floating Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-10 z-50 animate-in slide-in-from-bottom-8 duration-500 backdrop-blur-xl border border-white/10 ring-1 ring-white/20">
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight">{selectedIds.length} thiết bị đang chọn</span>
            <button onClick={() => setSelectedIds([])} className="text-xs text-gray-400 hover:text-white underline text-left transition-colors font-medium">Hủy chọn</button>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <button 
            onClick={() => setShowBorrowModal(true)}
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 rounded-2xl text-sm font-black transition-all shadow-lg shadow-brand-500/40 active:scale-95 flex items-center gap-2"
          >
            Mượn ngay <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Bulk Borrow Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Xác nhận mượn hàng loạt</h2>
            <p className="text-gray-500 text-sm mb-8 font-medium">Bạn đang đăng ký mượn <b>{selectedIds.length}</b> thiết bị.</p>
            
            <form onSubmit={handleBulkBorrow} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Chọn ngày dự kiến trả</label>
                <input 
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none font-bold text-lg transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="flex-1 px-6 py-4 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={borrowLoading}
                  className="flex-1 px-6 py-4 bg-gray-900 text-white hover:bg-black rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {borrowLoading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN MƯỢN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentCatalog;
