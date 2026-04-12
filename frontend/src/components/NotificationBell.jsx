import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bell, Package, CalendarDays, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(data);
    } catch (err) {
      console.error('Lỗi tải thông báo');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Polling every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications', {}, config);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'borrow': return <Package className="text-brand-500" size={16} />;
      case 'reservation': return <CalendarDays className="text-indigo-500" size={16} />;
      case 'overdue': return <AlertTriangle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors group"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-brand-600 animate-swing' : 'text-gray-500'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl border-gray-100 overflow-hidden z-[100] animate-fade-in-up">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-bold">Đánh dấu tất cả</button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic text-sm">Không có thông báo nào.</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 ${!n.isRead ? 'bg-brand-50/30' : 'hover:bg-gray-50'}`}
                >
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>}
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
             <Link to="/profile" onClick={() => setShowDropdown(false)} className="text-xs font-bold text-gray-500 hover:text-brand-600">Xem tất cả trong hồ sơ</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
