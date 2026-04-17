import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AuthContext } from '../context/AuthContext';
import { Users, Lock, Unlock, Shield, UserPlus, X, Eye, EyeOff, Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet, Trash2, Search, ArrowUpDown, ChevronUp, ChevronDown, Pencil } from 'lucide-react';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({ fullname: '', student_id: '', password: '', role: 'student' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullname', direction: 'asc' });

  // Edit User State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullname: '', student_id: '', password: '', role: 'student' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Import Excel state
  const [importResult, setImportResult] = useState(null); // { success, skipped, errors, message }
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users', config);
      setUsersList(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleLock = async (targetUserId, currentStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${currentStatus ? 'MỞ KHÓA' : 'KHÓA'} tài khoản này?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/users/${targetUserId}/status`, { isLocked: !currentStatus }, config);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái');
    }
  };

  const deleteUser = async (targetUserId, name) => {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${targetUserId}`, config);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa tài khoản');
    }
  };

  const changeRole = async (targetUserId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Bạn có chắc muốn đổi quyền người này thành ${newRole.toUpperCase()}?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/users/${targetUserId}/status`, { role: newRole }, config);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi đổi phân quyền');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-purple-600" /> : <ChevronDown size={14} className="text-purple-600" />;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users', createForm, config);
      setShowCreateModal(false);
      setCreateForm({ fullname: '', student_id: '', password: '', role: 'student' });
      fetchUsers();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (usr) => {
    setEditingUser(usr);
    setEditForm({
      fullname: usr.fullname,
      student_id: usr.student_id,
      password: '',
      role: usr.role || 'student'
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    
    const payload = {
      fullname: editForm.fullname,
      student_id: editForm.student_id,
      role: editForm.role
    };
    if (editForm.password && editForm.password.trim() !== '') {
      payload.password = editForm.password;
    }

    try {
      await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, payload, config);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers(); // Tự động load danh sách mới
    } catch (error) {
      setEditError(error.response?.data?.message || 'Lỗi khi cập nhật tài khoản');
    } finally {
      setEditLoading(false);
    }
  };

  // ===================== EXPORT EXCEL =====================
  const handleExportExcel = () => {
    const exportData = usersList.map(u => ({
      'Mã Sinh Viên / MSNV': u.student_id,
      'Họ và Tên': u.fullname,
      'Vai trò': u.role === 'admin' ? 'admin' : 'student',
      'Đang mượn (SL)': u.activeBorrowsCount || 0,
      'Trạng thái': u.isLocked ? 'Bị khóa' : 'Hoạt động',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    // Định dạng cột rộng hơn
    ws['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 12 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachSinhVien');
    XLSX.writeFile(wb, `DanhSachSinhVien_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ===================== DOWNLOAD TEMPLATE =====================
  const handleDownloadTemplate = () => {
    const templateData = [
      { 'ho_va_ten': 'Nguyễn Văn A', 'ma_sinh_vien': 'sv002', 'mat_khau': '123456', 'vai_tro': 'student' },
      { 'ho_va_ten': 'Trần Thị B',   'ma_sinh_vien': 'sv003', 'mat_khau': '123456', 'vai_tro': 'student' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MauNhapSinhVien');
    XLSX.writeFile(wb, 'MauNhapSinhVien.xlsx');
  };

  // ===================== IMPORT EXCEL =====================
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // reset để có thể chọn lại cùng file

    setImportLoading(true);
    setImportResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (rows.length === 0) {
        setImportResult({ type: 'error', message: 'File Excel không có dữ liệu.' });
        setImportLoading(false);
        return;
      }

      // Map cột linh hoạt (hỗ trợ cả tên cột tiếng Anh và template mẫu)
      const users = rows.map(r => ({
        fullname:   String(r['ho_va_ten']     || r['Họ và Tên']              || r['fullname'] || '').trim(),
        student_id: String(r['ma_sinh_vien']  || r['Mã Sinh Viên / MSNV']    || r['student_id'] || '').trim(),
        password:   String(r['mat_khau']      || r['password']               || '123456').trim(),
        role:       String(r['vai_tro']       || r['Vai trò']                || r['role'] || 'student').trim(),
      }));

      const { data } = await axios.post('http://localhost:5000/api/users/bulk-import', { users }, config);
      setImportResult({ type: 'success', ...data });
      fetchUsers();
    } catch (err) {
      setImportResult({ type: 'error', message: err.response?.data?.message || 'Lỗi khi đọc hoặc nhập file Excel.' });
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center my-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

  const filteredUsers = usersList.filter(u => 
    u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortConfig.key === 'totalBorrowsCount') {
      return sortConfig.direction === 'asc' 
        ? a.totalBorrowsCount - b.totalBorrowsCount
        : b.totalBorrowsCount - a.totalBorrowsCount;
    }
    
    // Default string sorting
    const valA = a[sortConfig.key] || '';
    const valB = b[sortConfig.key] || '';
    
    if (sortConfig.direction === 'asc') {
      return valA.toString().localeCompare(valB.toString());
    } else {
      return valB.toString().localeCompare(valA.toString());
    }
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-3 rounded-xl shadow-lg shadow-purple-600/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Người Dùng</h1>
            <p className="text-sm text-gray-500 mt-0.5">{usersList.length} tài khoản trong hệ thống</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tải file mẫu */}
          <button onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 font-semibold transition-all">
            <FileSpreadsheet size={16} /> Tải file mẫu
          </button>

          {/* Import Excel */}
          <button onClick={() => fileInputRef.current?.click()} disabled={importLoading}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border-2 border-green-500 text-green-700 bg-green-50 hover:bg-green-100 font-semibold transition-all disabled:opacity-50">
            <Upload size={16} /> {importLoading ? 'Đang nhập...' : 'Nhập Excel'}
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />

          {/* Export Excel */}
          <button onClick={handleExportExcel}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border-2 border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold transition-all">
            <Download size={16} /> Xuất Excel
          </button>

          {/* Thêm tài khoản */}
          <button onClick={() => { setShowCreateModal(true); setCreateError(''); }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <UserPlus size={18} /> Thêm Tài Khoản
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Tìm theo họ tên hoặc mã sinh viên..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm outline-none transition-all shadow-sm"
        />
      </div>

      {/* Import Result Banner */}
      {importResult && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm font-medium animate-fade-in
          ${importResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {importResult.type === 'success' ? <CheckCircle size={20} className="shrink-0 mt-0.5 text-green-600" /> : <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />}
          <div className="flex-1">
            <p className="font-bold">{importResult.message}</p>
            {importResult.errors?.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {importResult.errors.map((e, i) => <li key={i} className="text-xs opacity-80">• {e}</li>)}
              </ul>
            )}
          </div>
          <button onClick={() => setImportResult(null)} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 bg-gray-50/50">
                <th className="py-4 px-6 font-semibold cursor-pointer group" onClick={() => handleSort('student_id')}>
                  <div className="flex items-center gap-1">Mã SV / MSNV {getSortIcon('student_id')}</div>
                </th>
                <th className="py-4 px-6 font-semibold cursor-pointer group" onClick={() => handleSort('fullname')}>
                  <div className="flex items-center gap-1">Họ và Tên {getSortIcon('fullname')}</div>
                </th>
                <th className="py-4 px-6 font-semibold">Đang mượn</th>
                <th className="py-4 px-6 font-semibold cursor-pointer group text-center" onClick={() => handleSort('totalBorrowsCount')}>
                  <div className="flex items-center justify-center gap-1">Tổng lượt mượn {getSortIcon('totalBorrowsCount')}</div>
                </th>
                <th className="py-4 px-6 font-semibold">Phân quyền</th>
                <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
                <th className="py-4 px-6 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 italic font-medium bg-gray-50/20">
                    Không tìm thấy người dùng phù hợp với từ khóa "{searchTerm}"
                  </td>
                </tr>
              ) : (
                sortedUsers.map((usr) => (
                  <tr key={usr._id} className={`transition-colors ${usr.isLocked ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                    <td className="py-4 px-6 font-mono font-medium text-gray-900">{usr.student_id}</td>
                    <td className="py-4 px-6 font-medium">
                      <Link to={`/admin/users/${usr._id}/history`} className="text-brand-600 hover:text-brand-800 hover:underline transition-colors block">
                        {usr.fullname}
                      </Link>
                      {usr._id === user._id && <span className="text-xs text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full mt-1 inline-block">Bạn</span>}
                    </td>
                    <td className="py-4 px-6">
                      {usr.activeBorrowsCount > 0 ? (
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                          <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs w-fit">
                            {usr.activeBorrowsCount} thiết bị
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {usr.borrowedItems?.map((item, idx) => (
                              <span key={idx} className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200" title={item}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Không có</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-xs">
                        {usr.totalBorrowsCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${usr.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {usr.role === 'admin' ? 'Admin' : 'Sinh viên'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {usr.isLocked ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100 px-3 py-1.5 rounded-full"><Lock size={14} /> Đang bị khóa</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-full"><Unlock size={14} /> Hoạt động</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {usr.student_id !== 'admin' && usr._id !== user._id && (
                          <>
                            <button title="Cấp / Hủy quyền Admin" onClick={() => changeRole(usr._id, usr.role)}
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200">
                              <Shield size={18} />
                            </button>
                            <button title={usr.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'} onClick={() => toggleLock(usr._id, usr.isLocked)}
                              className={`p-2 rounded-lg transition-colors border ${usr.isLocked ? 'text-green-600 hover:bg-green-50 border-transparent hover:border-green-200' : 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-200'}`}>
                              {usr.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                            </button>
                            <button title="Sửa tài khoản" onClick={() => openEditModal(usr)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                              <Pencil size={18} />
                            </button>
                            <button title="Xóa tài khoản" onClick={() => deleteUser(usr._id, usr.fullname)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-xl"><UserPlus size={20} className="text-purple-600" /></div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Tạo tài khoản mới</h2>
                  <p className="text-xs text-gray-500">Thêm sinh viên hoặc admin vào hệ thống</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span>⚠️</span> {createError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên <span className="text-red-500">*</span></label>
                <input type="text" value={createForm.fullname} onChange={e => setCreateForm({ ...createForm, fullname: e.target.value })}
                  placeholder="VD: Nguyễn Văn B" required
                  className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã sinh viên / MSNV <span className="text-red-500">*</span></label>
                <input type="text" value={createForm.student_id} onChange={e => setCreateForm({ ...createForm, student_id: e.target.value })}
                  placeholder="VD: sv002" required
                  className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự" required
                    className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò</label>
                <div className="flex gap-3">
                  {['student', 'admin'].map(r => (
                    <button key={r} type="button" onClick={() => setCreateForm({ ...createForm, role: r })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                        ${createForm.role === r
                          ? (r === 'admin' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-brand-500 bg-brand-50 text-brand-700')
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {r === 'student' ? '👤 Sinh viên' : '🛡️ Admin'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors">Hủy</button>
                <button type="submit" disabled={createLoading}
                  className={`flex-1 py-2.5 rounded-xl text-white font-semibold transition-all ${createLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20'}`}>
                  {createLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl"><Pencil size={20} className="text-blue-600" /></div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Sửa thông tin tài khoản</h2>
                  <p className="text-xs text-gray-500">Cập nhật thông tin sinh viên hoặc admin</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span>⚠️</span> {editError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên <span className="text-red-500">*</span></label>
                <input type="text" value={editForm.fullname} onChange={e => setEditForm({ ...editForm, fullname: e.target.value })}
                  placeholder="VD: Nguyễn Văn B" required
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã sinh viên / MSNV <span className="text-red-500">*</span></label>
                <input type="text" value={editForm.student_id} onChange={e => setEditForm({ ...editForm, student_id: e.target.value })}
                  placeholder="VD: sv002" required
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu mới (Tùy chọn)</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={editForm.password}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Bỏ trống nếu không muốn đổi"
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò</label>
                <div className="flex gap-3">
                  {['student', 'admin'].map(r => (
                    <button key={r} type="button" onClick={() => setEditForm({ ...editForm, role: r })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                        ${editForm.role === r
                          ? (r === 'admin' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-blue-500 bg-blue-50 text-blue-700')
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {r === 'student' ? '👤 Sinh viên' : '🛡️ Admin'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors">Hủy</button>
                <button type="submit" disabled={editLoading}
                  className={`flex-1 py-2.5 rounded-xl text-white font-semibold transition-all ${editLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'}`}>
                  {editLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
