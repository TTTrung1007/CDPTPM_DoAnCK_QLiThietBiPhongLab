import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Plus, Trash2, Edit2, X } from 'lucide-react';

const LabManagement = () => {
  const [labs, setLabs] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchLabs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/labs');
      setLabs(response.data);
    } catch (error) { console.error('Error fetching labs:', error); }
  };

  useEffect(() => { fetchLabs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const labData = { name, location, capacity };
      
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/labs/${editingId}`, 
          labData, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsEditing(false);
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/labs', 
          labData, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setName(''); setLocation(''); setCapacity(30);
      fetchLabs();
    } catch (error) { alert(isEditing ? 'Lỗi cập nhật phòng Lab' : 'Lỗi tạo phòng Lab'); }
  };

  const handleEdit = (lab) => {
    setName(lab.name);
    setLocation(lab.location);
    setCapacity(lab.capacity);
    setEditingId(lab._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setName('');
    setLocation('');
    setCapacity(30);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa phòng lab này?')) return;
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.delete(`http://localhost:5000/api/labs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLabs();
    } catch (error) { alert('Lỗi xóa phòng lab'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <MapPin className="h-8 w-8 text-brand-600" /> Quản lý Phòng Lab
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Sửa Thông Tin Lab' : 'Thêm Lab Mới'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên phòng Lab</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vị trí (Tòa nhà / Tầng)</label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sức chứa (số lượng thiết bị)</label>
                <input type="number" required value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">
                  {isEditing ? <Edit2 size={18} /> : <Plus size={18} />} 
                  {isEditing ? 'Cập Nhật Lab' : 'Thêm Lab'}
                </button>
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} className="flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <X size={18} /> Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Lab</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vị trí</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sức chứa</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {labs.map((lab) => (
                  <tr key={lab._id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lab.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.capacity} thiết bị</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(lab)} className="text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-600 hover:text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                          <Edit2 size={16} /> Sửa
                        </button>
                        <button onClick={() => handleDelete(lab._id)} className="text-red-500 border border-red-200 bg-red-50 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                          <Trash2 size={16} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabManagement;
