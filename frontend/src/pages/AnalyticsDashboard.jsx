import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
   PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Activity, TrendingUp, Package } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboard = () => {
   const { user } = useContext(AuthContext);
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   const config = { headers: { Authorization: `Bearer ${user.token}` } };

   useEffect(() => {
      const fetchAnalytics = async () => {
         try {
            const { data } = await axios.get('http://localhost:5000/api/equipment/analytics', config);
            setData(data);
            setLoading(false);
         } catch (error) {
            console.error('Lỗi khi tải dữ liệu thống kê');
            setLoading(false);
         }
      };
      fetchAnalytics();
   }, []);

   if (loading) return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
               <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <BarChart3 className="text-brand-600" size={32} />
                  Trung tâm Phân tích
               </h1>
               <p className="text-gray-500 font-medium">Theo dõi hiệu suất và tình trạng thiết bị Lab theo thời gian thực.</p>
            </div>
            <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-2xl border border-brand-100 flex items-center gap-2 text-sm font-bold">
               <Activity size={16} /> Dữ liệu trực tiếp
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart: Status Distribution */}
            <div className="glass-card p-8 rounded-3xl group">
               <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <PieIcon size={20} className="text-brand-500" /> Tỷ lệ trạng thái thiết bị
               </h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={data?.statusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={80}
                           outerRadius={110}
                           paddingAngle={8}
                           dataKey="value"
                        >
                           {data?.statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Pie>
                        <Tooltip
                           contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Bar Chart: Most Borrowed */}
            <div className="glass-card p-8 rounded-3xl group">
               <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-500" /> Top 5 linh kiện được mượn nhiều nhất
               </h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data?.topBorrowed} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                           dataKey="name"
                           type="category"
                           width={100}
                           tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                        />
                        <Tooltip
                           cursor={{ fill: '#f8fafc' }}
                           contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="borrow_count" name="Lượt mượn" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={25} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Area Chart: Usage Activity */}
         <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity size={20} className="text-brand-500" /> Hoạt động mượn đồ (7 ngày qua)
               </h3>
               <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                  Cập nhật mới nhất
               </div>
            </div>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.activity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <XAxis
                        dataKey="_id"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                     />
                     <YAxis
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                     />
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                     />
                     <Area
                        type="monotone"
                        dataKey="total"
                        name="Tổng lượt mượn"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-6 rounded-3xl text-white shadow-xl shadow-brand-500/20">
               <div className="flex justify-between items-start mb-4">
                  <Package size={24} className="opacity-80" />
               </div>
               <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Tổng thiết bị</p>
               <p className="text-4xl font-black">{data?.statusData.reduce((acc, curr) => acc + curr.value, 0)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50">
               <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 text-center md:text-left">Trung bình mượn/ngày</p>
               <p className="text-4xl font-black text-gray-900 text-center md:text-left">
                  {(data?.activity.length > 0 ? (data.activity.reduce((acc, curr) => acc + curr.total, 0) / data.activity.length).toFixed(1) : 0)}
               </p>
            </div>
         </div>
      </div>
   );
};

export default AnalyticsDashboard;
