import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Trash2 } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) { console.error('Error fetching categories:', error); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/categories', 
        { name, slug }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName(''); setSlug('');
      fetchCategories();
    } catch (error) { alert('Lỗi tạo danh mục'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (error) { alert('Lỗi xóa danh mục'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <Layers className="h-8 w-8 text-brand-600" /> Quản lý Danh mục (Categories)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Thêm Danh Mục Mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên dạnh mục</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug (URL friendly)</label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <button type="submit" className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">
                <Plus size={18} /> Thêm Danh Mục
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Danh Mục</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button onClick={() => handleDelete(cat._id)} className="text-red-500 border border-red-200 bg-red-50 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                        <Trash2 size={16} /> Xóa
                      </button>
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

export default CategoryManagement;
