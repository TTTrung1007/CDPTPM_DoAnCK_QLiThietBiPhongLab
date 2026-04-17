import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Plus, QrCode, MonitorPlay, Activity, PackageCheck, AlertCircle, FileDown, FileUp, Search, Trophy, Star, Medal, ShieldCheck, CheckCircle, XCircle, RotateCcw, UserPlus, X, Eye, EyeOff, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowSearch, setBorrowSearch] = useState('');
  const [eqSearch, setEqSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLab, setFilterLab] = useState('');

  // Create state
  const [categories, setCategories] = useState([]);
  const [labs, setLabs] = useState([]);
  const [newName, setNewName] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newManual, setNewManual] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newLabId, setNewLabId] = useState('');
  const [newImage, setNewImage] = useState(''); // Image URL or Base64
  const [formMessage, setFormMessage] = useState({ type: '', text: '' }); // Form success/error message
  const [topBorrowers, setTopBorrowers] = useState([]); // List of top borrowers
  const [topBorrowerFilter, setTopBorrowerFilter] = useState({
    day: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Quick Add User State
  const [showQuickAddUser, setShowQuickAddUser] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState('manual'); // 'manual' or 'excel'
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({ fullname: '', student_id: '', password: '', role: 'student' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [editingEq, setEditingEq] = useState(null);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [selectedEqForMaint, setSelectedEqForMaint] = useState(null);

  // Return Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnRecord, setReturnRecord] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Bình thường');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnScore, setReturnScore] = useState(100);

  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [newMaint, setNewMaint] = useState({ description: '', technician: '', cost: '', status: 'completed' }); // completed, pending, failed
  const [selectedEqIds, setSelectedEqIds] = useState([]);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchData = async () => {
    try {
      const [{ data: st }, { data: eq }, { data: ab }, { data: cats }, { data: lbs }] = await Promise.all([
        axios.get('http://localhost:5000/api/equipment/dashboard', config),
        axios.get('http://localhost:5000/api/equipment', config),
        axios.get('http://localhost:5000/api/borrow/active', config),
        axios.get('http://localhost:5000/api/categories', config),
        axios.get('http://localhost:5000/api/labs', config)
      ]);
      setStats(st);
      setEquipments(eq);
      setActiveBorrows(ab);
      setCategories(cats);
      setLabs(lbs);
      if (cats.length > 0) setNewCategoryId(cats[0]._id);
      if (lbs.length > 0) setNewLabId(lbs[0]._id);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchTopBorrowers = async () => {
    try {
      const { day, month, year } = topBorrowerFilter;
      const { data } = await axios.get(`http://localhost:5000/api/borrow/top-borrowers?day=${day}&month=${month}&year=${year}`, config);
      setTopBorrowers(data);
    } catch (error) {
      console.error('Lỗi khi lấy top người mượn:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTopBorrowers();
  }, [topBorrowerFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });
    try {
      await axios.post('http://localhost:5000/api/equipment', {
        name: newName,
        serial_number: newSerial,
        manual_url: newManual,
        category_id: newCategoryId,
        lab_id: newLabId,
        image_url: newImage
      }, config);
      setNewName('');
      setNewSerial('');
      setNewManual('');
      setNewImage('');
      setFormMessage({ type: 'success', text: 'Thêm thiết bị thành công!' });
      fetchData(); // reload

      // Auto clear message after 3 seconds
      setTimeout(() => setFormMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setFormMessage({ type: 'error', text: error.response?.data?.message || 'Lỗi khi tạo thiết bị' });
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users', createForm, config);
      setCreateForm({ fullname: '', student_id: '', password: '', role: 'student' });
      setCreateError('Tạo tài khoản thành công!');
      fetchData();
      fetchTopBorrowers();
      setTimeout(() => setCreateError(''), 3000);
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleImportUserFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      const buffer = await file.arrayBuffer();
      e.target.value = ''; // reset sau khi đọc xong
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (rows.length === 0) {
        setImportResult({ type: 'error', message: 'File Excel không có dữ liệu.' });
        setImportLoading(false);
        return;
      }

      const users = rows.map(r => ({
        fullname:   String(r['ho_va_ten']     || r['Họ và Tên']              || r['fullname'] || '').trim(),
        student_id: String(r['ma_sinh_vien']  || r['Mã Sinh Viên / MSNV']    || r['student_id'] || '').trim(),
        password:   String(r['mat_khau']      || r['password']               || '123456').trim(),
        role:       String(r['vai_tro']       || r['Vai trò']                || r['role'] || 'student').trim(),
      }));

      const { data } = await axios.post('http://localhost:5000/api/users/bulk-import', { users }, config);
      setImportResult({ type: 'success', ...data });
      fetchData();
      fetchTopBorrowers();
    } catch (err) {
      setImportResult({ type: 'error', message: err.response?.data?.message || 'Lỗi khi đọc hoặc nhập file Excel.' });
    } finally {
      setImportLoading(false);
    }
  };

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

  const handleConfirmReturn = async () => {
    try {
      await axios.put(`http://localhost:5000/api/borrow/${returnRecord._id}/return`, {
        condition: returnCondition,
        notes: returnNotes,
        condition_score: returnScore
      }, config);
      setShowReturnModal(false);
      setReturnRecord(null);
      setReturnCondition('Bình thường');
      setReturnNotes('');
      setReturnScore(100);
      fetchData(); // reload
    } catch (error) {
      alert('Lỗi xác nhận: ' + (error.response?.data?.message || error.message));
    }
  };

  const openReturnModal = (record) => {
    setReturnRecord(record);
    setReturnScore(record.equipment_id?.condition_score || 100);
    setShowReturnModal(true);
  };

  const handleSetMaintenance = async (eqId, isMaint) => {
    try {
      await axios.put(`http://localhost:5000/api/equipment/${eqId}/status`, {
        status: isMaint ? 'maintenance' : 'available'
      }, config);
      fetchData();
    } catch (error) {
      alert('Lỗi đổi trạng thái: ' + (error.response?.data?.message || 'Thiết bị không tồn tại'));
      fetchData();
    }
  };

  const handleDelete = async (eqId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này? Hành động này không thể hoàn tác.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/equipment/${eqId}`, config);
      fetchData();
    } catch (error) {
      alert('Lỗi khi xóa thiết bị: ' + (error.response?.data?.message || error.message));
      fetchData();
    }
  };

  const filteredEquipments = equipments.filter(eq => {
    const s = eqSearch.toLowerCase();
    const searchMatch = eq.name.toLowerCase().includes(s) || eq.serial_number.toLowerCase().includes(s);
    const categoryMatch = !filterCategory || eq.category_id?._id === filterCategory;
    const labMatch = !filterLab || eq.lab_id?._id === filterLab;
    return searchMatch && categoryMatch && labMatch;
  });

  const submitEdit = async () => {
    if (!editingEq.name.trim() || !editingEq.serial.trim()) {
      alert('Tên và Serial không được để trống.');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/equipment/${editingEq.id}`, {
        name: editingEq.name,
        serial_number: editingEq.serial,
        manual_url: editingEq.manual,
        category_id: editingEq.category_id || undefined,
        lab_id: editingEq.lab_id || undefined,
        image_url: editingEq.image_url
      }, config);
      setEditingEq(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi sửa thiết bị');
    }
  };

  const handleBulkUpdateStatus = async (status) => {
    if (selectedEqIds.length === 0) return;
    try {
      await axios.put('http://localhost:5000/api/equipment/bulk-status', { ids: selectedEqIds, status }, config);
      setSelectedEqIds([]);
      fetchData();
    } catch (error) {
      alert('Lỗi cập nhật hàng loạt: ' + (error.response?.data?.message || 'Không có phản hồi từ máy chủ'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEqIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedEqIds.length} thiết bị đã chọn?`)) return;
    try {
      await axios.delete('http://localhost:5000/api/equipment/bulk', { ...config, data: { ids: selectedEqIds } });
      setSelectedEqIds([]);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa hàng loạt');
    }
  };

  const toggleSelectAll = () => {
    const visibleIds = equipments
      .filter(eq => {
        const s = eqSearch.toLowerCase();
        return eq.name.toLowerCase().includes(s) || eq.serial_number.toLowerCase().includes(s);
      })
      .map(eq => eq._id);

    if (selectedEqIds.length === visibleIds.length) {
      setSelectedEqIds([]);
    } else {
      setSelectedEqIds(visibleIds);
    }
  };

  const toggleSelect = (id) => {
    if (selectedEqIds.includes(id)) {
      setSelectedEqIds(selectedEqIds.filter(i => i !== id));
    } else {
      setSelectedEqIds([...selectedEqIds, id]);
    }
  };

  const fetchMaintHistory = async (eqId) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/equipment/${eqId}/maintenance`, config);
      setMaintenanceHistory(data);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử bảo trì:', error);
    }
  };

  const handleAddMaint = async (e) => {
    e.preventDefault();
    if (!newMaint.description || !newMaint.technician) return alert('Vui lòng nhập đủ mô tả và kỹ thuật viên');
    try {
      await axios.post(`http://localhost:5000/api/equipment/${selectedEqForMaint._id}/maintenance`, {
        ...newMaint,
        equipment_id: selectedEqForMaint._id
      }, config);
      setNewMaint({ description: '', technician: '', cost: '', status: 'completed' });
      fetchMaintHistory(selectedEqForMaint._id);
    } catch (error) {
      alert('Lỗi khi thêm nhật ký bảo trì');
    }
  };

  const handleExport = () => {
    const dataToExport = equipments.map(eq => ({
      'Tên thiết bị': eq.name,
      'Số Serial': eq.serial_number,
      'Danh mục': eq.category_id?.name || '',
      'Phòng Lab': eq.lab_id?.name || '',
      'Trạng thái': eq.status === 'available' ? 'Sẵn sàng' : eq.status === 'borrowed' ? 'Đang mượn' : 'Bảo trì',
      'Link hướng dẫn': eq.manual_url || '',
      'Ảnh minh họa': eq.image_url || '',
      'Ngày tạo': new Date(eq.createdAt).toLocaleDateString('vi-VN')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thiết bị");
    XLSX.writeFile(wb, "danh_sach_thiet_bi.xlsx");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map Vietnamese headers or flexible mapping
        const formattedData = data.map(row => {
          // Match category by name
          const categoryName = row['Danh mục'] || row['Danh muc'] || row['Category'] || '';
          const matchedCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

          // Match lab by name
          const labName = row['Phòng Lab'] || row['Phong Lab'] || row['Lab'] || '';
          const matchedLab = labs.find(l => l.name.toLowerCase() === labName.toLowerCase());

          return {
            name: row['Tên thiết bị'] || row['Ten thiet bi'] || row['Name'],
            serial_number: String(row['Số Serial'] || row['So Serial'] || row['Serial'] || row['S/N']),
            manual_url: row['Link hướng dẫn'] || row['Link tài liệu'] || row['Manual URL'] || row['manual_url'] || '',
            image_url: row['Ảnh minh họa'] || row['Anh minh hoa'] || row['Image URL'] || row['image_url'] || '',
            category_id: matchedCategory?._id || '',
            lab_id: matchedLab?._id || ''
          };
        }).filter(item => item.name && item.serial_number);

        if (formattedData.length === 0) {
          alert('Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra tiêu đề cột (Tên thiết bị, Số Serial).');
          return;
        }

        if (window.confirm(`Tìm thấy ${formattedData.length} thiết bị. Bạn có muốn nhập không?`)) {
          const res = await axios.post('http://localhost:5000/api/equipment/bulk', { equipments: formattedData }, config);
          alert(`Thành công: ${res.data.successCount}, Lỗi: ${res.data.errorCount}`);
          if (res.data.errors.length > 0) {
            console.log('Errors:', res.data.errors);
          }
          fetchData();
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi xử lý file Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  if (loading) return <div className="flex justify-center my-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

  return (
    <div className="max-w-full mx-auto px-2 lg:px-4 py-4 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-brand-600 p-3.5 rounded-2xl shadow-xl shadow-brand-500/20 transform hover:scale-105 transition-transform">
            <LayoutDashboard className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hệ thống Quản trị Lab</h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-1">Giám sát thiết bị, duyệt trả và vinh danh sinh viên tích cực.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2 mr-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-50 flex items-center justify-center text-[10px] font-bold text-brand-600 px-1">
              {stats?.totalUsers ? `+${stats.totalUsers}` : '+0'}
            </div>
          </div>
          <button onClick={() => { setShowQuickAddUser(true); setCreateError(''); setImportResult(null); }} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 text-sm">
            <Plus size={18} />
            Thêm nhanh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Tổng thiết bị', value: stats.totalCount, icon: <MonitorPlay className="w-6 h-6" />, color: 'from-blue-600 to-indigo-600', lightColor: 'bg-blue-50 text-blue-600' },
            { label: 'Sẵn sàng', value: stats.availableCount, icon: <PackageCheck className="w-6 h-6" />, color: 'from-emerald-500 to-teal-600', lightColor: 'bg-emerald-50 text-emerald-600' },
            { label: 'Đang mượn', value: stats.borrowedCount, icon: <Activity className="w-6 h-6" />, color: 'from-amber-500 to-orange-600', lightColor: 'bg-amber-50 text-amber-600' },
            { label: 'Bảo trì', value: stats.maintenanceCount, icon: <AlertCircle className="w-6 h-6" />, color: 'from-rose-500 to-red-600', lightColor: 'bg-rose-50 text-rose-600' },
          ].map((item, i) => (
            <div key={i} className="group relative bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden font-sans">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-[0.03] -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${item.lightColor} shadow-sm group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live</div>
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 mb-1">{item.value}</p>
                <p className="text-sm font-semibold text-gray-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-10">
        {/* Secondary Sections Row - Now moved above the table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Active Borrows / Return Confirmation */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-100 border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Duyệt trả thiết bị</h2>
            </div>

            <div className="mb-6 relative group">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="MSSV, Tên hoặc Serial..."
                value={borrowSearch}
                onChange={e => setBorrowSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {activeBorrows.filter(record => {
                const s = borrowSearch.toLowerCase();
                return (
                  record.equipment_id?.name?.toLowerCase().includes(s) ||
                  record.equipment_id?.serial_number?.toLowerCase().includes(s) ||
                  record.user_id?.fullname?.toLowerCase().includes(s) ||
                  record.user_id?.student_id?.toLowerCase().includes(s)
                );
              }).sort((a, b) => {
                const now = new Date().setHours(0, 0, 0, 0);
                const dateA = new Date(a.expected_return_date).setHours(0, 0, 0, 0);
                const dateB = new Date(b.expected_return_date).setHours(0, 0, 0, 0);
                const aOverdue = now > dateA;
                const bOverdue = now > dateB;
                // Quá hạn lên trước
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                // Cùng trạng thái: sắp xếp ngày gần nhất lên trên
                return dateA - dateB;
              }).length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm font-medium">Không có yêu cầu trả máy</p>
                </div>
              ) : (
                activeBorrows.filter(record => {
                  const s = borrowSearch.toLowerCase();
                  return (
                    record.equipment_id?.name?.toLowerCase().includes(s) ||
                    record.equipment_id?.serial_number?.toLowerCase().includes(s) ||
                    record.user_id?.fullname?.toLowerCase().includes(s) ||
                    record.user_id?.student_id?.toLowerCase().includes(s)
                  );
                }).sort((a, b) => {
                  const now = new Date().setHours(0, 0, 0, 0);
                  const dateA = new Date(a.expected_return_date).setHours(0, 0, 0, 0);
                  const dateB = new Date(b.expected_return_date).setHours(0, 0, 0, 0);
                  const aOverdue = now > dateA;
                  const bOverdue = now > dateB;
                  // Quá hạn lên trước
                  if (aOverdue && !bOverdue) return -1;
                  if (!aOverdue && bOverdue) return 1;
                  // Cùng trạng thái: sắp xếp ngày gần nhất lên trên
                  return dateA - dateB;
                }).map(record => {
                  const expectedReturn = new Date(record.expected_return_date);
                  const isOverdue = new Date().setHours(0, 0, 0, 0) > expectedReturn.setHours(0, 0, 0, 0);

                  return (
                    <div key={record._id} className={`p-4 border rounded-2xl flex flex-col gap-3 group transition-all hover:shadow-lg hover:-translate-y-0.5 ${isOverdue ? 'border-red-100 bg-red-50/40 animate-pulse' : 'border-gray-100 bg-white shadow-sm shadow-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate group-hover:text-brand-600 transition-colors">{record.equipment_id?.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{record.equipment_id?.serial_number}</p>
                        </div>
                        {isOverdue && <span className="flex items-center gap-1 text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm shadow-rose-200"><AlertCircle size={10} /> Quá hạn</span>}
                      </div>

                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border-2 border-white shadow-sm overflow-hidden shrink-0">
                          {record.user_id?.fullname?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-gray-800 truncate">{record.user_id?.fullname}</p>
                          <p className="text-[10px] text-gray-400 leading-none">{record.user_id?.student_id}</p>
                        </div>
                        <div className="ml-auto text-right shrink-0">
                          <p className={`text-[10px] font-black ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>Hạn trả</p>
                          <p className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                            {new Date(record.expected_return_date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => openReturnModal(record)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-2 border uppercase tracking-wider ${isOverdue ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-red-200' : 'bg-white text-brand-600 hover:bg-brand-600 hover:text-white border-brand-100 hover:border-brand-600'
                          }`}
                      >
                        {isOverdue ? <XCircle size={14} /> : <ShieldCheck size={14} />}
                        Duyệt trả máy
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Top Borrowers Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden relative h-full">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-50 rounded-full opacity-50 blur-3xl"></div>
            <div className="flex flex-col gap-4 mb-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-100 text-brand-600 rounded-xl shadow-inner">
                    <Trophy size={22} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Top Người mượn</h2>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-brand-100">
                  <Star size={12} fill="currentColor" /> Top 5
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={topBorrowerFilter.day}
                  onChange={e => setTopBorrowerFilter({ ...topBorrowerFilter, day: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-brand-500"
                >
                  <option value="">Cả ngày</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Ngày {i + 1}</option>
                  ))}
                </select>
                <select
                  value={topBorrowerFilter.month}
                  onChange={e => setTopBorrowerFilter({ ...topBorrowerFilter, month: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-brand-500"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 relative">
              {topBorrowers.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  Chưa có dữ liệu mượn đồ trong thời gian này
                </div>
              ) : (
                topBorrowers.map((item, index) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-brand-50/50 transition-all group border border-transparent hover:border-brand-100">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm
                        ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-50' :
                          index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white ring-4 ring-slate-50' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white ring-4 ring-orange-50' :
                              'bg-blue-50 text-brand-600 border border-blue-100'}`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : item.fullname?.charAt(0) || index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-600 transition-colors">{item.fullname}</h4>
                      <p className="text-[11px] text-gray-500 font-medium tracking-tight uppercase">{item.student_id} <span className="mx-1 opacity-20">|</span> {item.class_name || 'Hệ thống'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-brand-600 leading-none">{item.borrowCount}</div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lượt mượn</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-dashed border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-bold italic">
                "Thống kê dựa trên tổng số lượt mượn đã thực hiện."
              </p>
            </div>
          </div>
        </div>

        {/* Equipment Management - Now Full Width */}
        <div className="w-full space-y-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-500" />
                Quản lý thiết bị
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors"
                  title="Xuất danh sách ra file Excel"
                >
                  <FileDown size={14} /> Xuất Excel
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer" title="Nhập danh sách từ file Excel">
                  <FileUp size={14} /> Nhập Excel
                  <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImport} />
                </label>
              </div>
            </div>

            <form onSubmit={handleCreate} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-100/50 mb-10 transition-all hover:shadow-brand-500/5">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                  <Plus size={20} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-800 tracking-tight">Thêm thiết bị mới vào hệ thống</h3>
              </div>

              {formMessage.text && (
                <div className={`p-4 mb-6 rounded-xl border flex items-start gap-3 backdrop-blur-sm animate-in fade-in ${formMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  <span className="mt-0.5">{formMessage.type === 'success' ? '✅' : '⚠️'}</span>
                  <p className="flex-1 font-medium text-sm">{formMessage.text}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Field: Name */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    Tên thiết bị <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Máy chiếu Panasonic PT-VW350"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-gray-50/30 border transition-all placeholder:text-gray-300"
                  />
                </div>

                {/* Field: Serial */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    Số Serial <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="S/N: 2024-X123"
                    value={newSerial}
                    onChange={e => setNewSerial(e.target.value)}
                    required
                    className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-gray-50/30 border transition-all placeholder:text-gray-300"
                  />
                </div>

                {/* Field: Category */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">Danh mục</label>
                  <select
                    value={newCategoryId}
                    onChange={e => setNewCategoryId(e.target.value)}
                    className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-gray-50/30 border transition-all appearance-none cursor-pointer"
                  >
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>

                {/* Field: Lab */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">Phòng Lab</label>
                  <select
                    value={newLabId}
                    onChange={e => setNewLabId(e.target.value)}
                    className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-gray-50/30 border transition-all appearance-none cursor-pointer"
                  >
                    {labs.map(lab => <option key={lab._id} value={lab._id}>{lab.name}</option>)}
                  </select>
                </div>

                {/* Field: Image */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">Ảnh minh họa</label>
                  <div className="flex gap-2 relative group">
                    <input
                      type="text"
                      placeholder="URL: https://... hoặc tải ảnh"
                      value={newImage}
                      onChange={e => setNewImage(e.target.value)}
                      className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-gray-50/30 border transition-all placeholder:text-gray-300"
                    />
                    <label className="bg-white hover:bg-brand-50 p-3 rounded-2xl cursor-pointer border border-gray-200 flex items-center justify-center shrink-0 shadow-sm transition-all text-gray-500 hover:text-brand-600 hover:border-brand-100">
                      <FileUp size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewImage(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Field: Manual URL */}
                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    Link tài liệu hướng dẫn
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (link PDF, trang web hướng dẫn sử dụng)"
                    value={newManual}
                    onChange={e => setNewManual(e.target.value)}
                    className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-gray-50/30 border transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>


              <div className="flex justify-center border-t border-gray-50 pt-8">
                <button type="submit" className="min-w-[200px] bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center py-4 px-10 text-sm font-black uppercase tracking-[0.2em] hover:-translate-y-1 active:scale-95 group">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} /> Hoàn tất và Thêm
                </button>
              </div>
            </form>

            <div className="mb-8 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px] group">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm tên thiết bị hoặc số Serial..."
                  value={eqSearch}
                  onChange={e => setEqSearch(e.target.value)}
                  className="w-full pl-12 pr-20 py-4 text-sm border-2 border-gray-100 rounded-2xl focus:border-brand-500/30 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all shadow-sm bg-white hover:border-gray-200"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <span className="px-2 py-1 bg-gray-50 rounded text-[10px] font-bold text-gray-400 border border-gray-200 uppercase">Alt + S</span>
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-brand-500/30 focus:ring-4 focus:ring-brand-500/5 outline-none bg-white text-sm font-semibold text-gray-600 transition-all cursor-pointer min-w-[160px]"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>

                <select
                  value={filterLab}
                  onChange={e => setFilterLab(e.target.value)}
                  className="px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-brand-500/30 focus:ring-4 focus:ring-brand-500/5 outline-none bg-white text-sm font-semibold text-gray-600 transition-all cursor-pointer min-w-[200px]"
                >
                  <option value="">Tất cả phòng Lab</option>
                  {labs.map(lab => <option key={lab._id} value={lab._id}>{lab.name}</option>)}
                </select>

                {(filterCategory || filterLab || eqSearch) && (
                  <button
                    onClick={() => { setEqSearch(''); setFilterCategory(''); setFilterLab(''); }}
                    className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl transition-all border-2 border-gray-100 flex items-center justify-center group"
                    title="Xóa bộ lọc"
                  >
                    <RotateCcw size={20} className="group-hover:rotate-[-120deg] transition-all duration-500" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto pb-6 custom-scrollbar">
              <table className="w-full min-w-[1000px] text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-3 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        checked={selectedEqIds.length > 0 && selectedEqIds.length === filteredEquipments.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-2 font-medium w-16">Ảnh</th>
                    <th className="py-3 px-2 font-medium w-44">Thiết bị</th>
                    <th className="py-3 px-2 font-medium w-28">Serial</th>
                    <th className="py-3 px-2 font-medium w-40">Danh mục / Lab</th>
                    <th className="py-3 px-1 font-medium text-center whitespace-nowrap text-xs w-20">Lượt mượn</th>
                    <th className="py-3 px-2 font-medium whitespace-nowrap text-xs w-28 text-center">Trạng thái</th>
                    <th className="py-3 px-2 font-medium whitespace-nowrap text-xs w-32 text-center">Thao tác</th>
                    <th className="py-3 px-2 font-medium text-center whitespace-nowrap text-xs w-24">Mã QR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEquipments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-10 text-center text-gray-500 italic">Không tìm thấy thiết bị phù hợp với bộ lọc.</td>
                    </tr>
                  ) : (
                    filteredEquipments.map(eq => (
                      <tr key={eq._id} className={`hover:bg-gray-50 transition-colors ${selectedEqIds.includes(eq._id) ? 'bg-brand-50/30' : ''}`}>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            checked={selectedEqIds.includes(eq._id)}
                            onChange={() => toggleSelect(eq._id)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden group/img">
                            {eq.image_url ? (
                              <img src={eq.image_url} alt={eq.name} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                            ) : (
                              <MonitorPlay className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{eq.name}</td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{eq.serial_number}</td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {eq.category_id?.name || '---'}<br />
                          {eq.lab_id?.name || '---'}
                        </td>
                        <td className="py-3 px-1 text-center">
                          <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg font-bold text-xs border border-brand-100">
                            {eq.borrow_count || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap
                            ${eq.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                              eq.status === 'borrowed' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-red-50 text-red-700 border-red-200'}`}>
                            {eq.status === 'available' ? 'Sẵn sàng' : eq.status === 'borrowed' ? 'Đang mượn' : 'Bảo trì'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-2">
                            {/* Status Controls */}
                            <div>
                              {eq.status === 'available' && (
                                <button onClick={() => handleSetMaintenance(eq._id, true)} className="text-xs text-orange-600 hover:text-orange-800 font-medium bg-orange-50 px-2 py-1 rounded">Báo bảo trì</button>
                              )}
                              {eq.status === 'maintenance' && (
                                <button onClick={() => handleSetMaintenance(eq._id, false)} className="text-xs text-green-600 hover:text-green-800 font-medium bg-green-50 px-2 py-1 rounded">Mở sẵn sàng</button>
                              )}
                            </div>
                            {/* Action Controls */}
                            <div className="flex gap-2">
                              <button onClick={() => setEditingEq({
                                id: eq._id,
                                name: eq.name,
                                serial: eq.serial_number,
                                manual: eq.manual_url,
                                category_id: eq.category_id?._id || '',
                                lab_id: eq.lab_id?._id || '',
                                image_url: eq.image_url || ''
                              })} className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">Sửa</button>
                              |
                              <button
                                onClick={() => { setSelectedEqForMaint(eq); fetchMaintHistory(eq._id); setShowMaintModal(true); }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
                              >
                                Nhật ký
                              </button>
                              |
                              <button
                                onClick={() => handleDelete(eq._id)}
                                disabled={eq.status === 'borrowed'}
                                className={`text-xs font-medium ${eq.status === 'borrowed' ? 'text-gray-300 cursor-not-allowed line-through' : 'text-red-600 hover:text-red-800'}`}
                                title={eq.status === 'borrowed' ? 'Không thể xóa khi đang mượn' : 'Xóa thiết bị'}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {eq.qr_code_url && (
                            <img src={eq.qr_code_url} alt="QR" className="w-10 h-10 border border-gray-200 rounded object-cover cursor-pointer hover:scale-150 transition-transform origin-right inline-block" title="Click để phóng to hoặc lưu" />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>


      {/* Edit Modal */}
      {editingEq && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Sửa thông tin thiết bị</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên thiết bị</label>
                <input type="text" value={editingEq.name} onChange={e => setEditingEq({ ...editingEq, name: e.target.value })} className="w-full border border-gray-300 focus:border-brand-500 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm transition-colors outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Serial Number</label>
                <input type="text" value={editingEq.serial} onChange={e => setEditingEq({ ...editingEq, serial: e.target.value })} className="w-full border border-gray-300 focus:border-brand-500 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm transition-colors outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục</label>
                  <select value={editingEq.category_id} onChange={e => setEditingEq({ ...editingEq, category_id: e.target.value })} className="w-full border border-gray-300 focus:border-brand-500 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm transition-colors outline-none">
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phòng Lab</label>
                  <select value={editingEq.lab_id} onChange={e => setEditingEq({ ...editingEq, lab_id: e.target.value })} className="w-full border border-gray-300 focus:border-brand-500 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm transition-colors outline-none">
                    <option value="">Chọn phòng Lab</option>
                    {labs.map(lab => <option key={lab._id} value={lab._id}>{lab.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ảnh minh họa (URL/Tải lên)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingEq.image_url || ''}
                    onChange={e => setEditingEq({ ...editingEq, image_url: e.target.value })}
                    className="w-full border border-gray-300 focus:border-brand-500 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm transition-colors outline-none"
                    placeholder="https://..."
                  />
                  <label className="bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-300 flex items-center justify-center cursor-pointer transition-colors shrink-0">
                    <FileUp size={18} className="text-gray-500" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setEditingEq({ ...editingEq, image_url: reader.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {editingEq.image_url && (
                  <div className="mt-3 relative w-24 h-24 group">
                    <img src={editingEq.image_url} className="w-full h-full rounded-xl border object-cover shadow-sm" />
                    <button
                      type="button"
                      onClick={() => setEditingEq({ ...editingEq, image_url: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <AlertCircle size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link tài liệu hướng dẫn (Manual URL)</label>
                <input type="url" value={editingEq.manual || ''} onChange={e => setEditingEq({ ...editingEq, manual: e.target.value })} className="w-full border border-gray-300 focus:border-brand-500 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm transition-colors outline-none" placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-8">
              <button onClick={() => setEditingEq(null)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors">Hủy</button>
              <button onClick={() => submitEdit()} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors shadow-sm">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
      {/* Maintenance History Modal */}
      {showMaintModal && selectedEqForMaint && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[110] backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Nhật ký bảo trì: {selectedEqForMaint.name}</h2>
                <p className="text-sm text-gray-500 font-mono">Serial: {selectedEqForMaint.serial_number}</p>
              </div>
              <button onClick={() => setShowMaintModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form to add new entry */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-l-4 border-brand-500 pl-3">Thêm nhật ký mới</h3>
                <form onSubmit={handleAddMaint} className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Mô tả hỏng hóc/sửa chữa</label>
                    <textarea
                      value={newMaint.description}
                      onChange={e => setNewMaint({ ...newMaint, description: e.target.value })}
                      className="w-full text-sm border-gray-200 rounded-xl focus:ring-brand-500 min-h-[80px]"
                      placeholder="Mô tả chi tiết..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Kỹ thuật viên</label>
                    <input
                      type="text"
                      value={newMaint.technician}
                      onChange={e => setNewMaint({ ...newMaint, technician: e.target.value })}
                      className="w-full text-sm border-gray-200 rounded-xl focus:ring-brand-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600">Chi phí (VNĐ)</label>
                      <input
                        type="number"
                        value={newMaint.cost}
                        onChange={e => setNewMaint({ ...newMaint, cost: e.target.value })}
                        className="w-full text-sm border-gray-200 rounded-xl focus:ring-brand-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600">Trạng thái</label>
                      <select
                        value={newMaint.status}
                        onChange={e => setNewMaint({ ...newMaint, status: e.target.value })}
                        className="w-full text-sm border-gray-200 rounded-xl focus:ring-brand-500"
                      >
                        <option value="completed">Hoàn thành</option>
                        <option value="pending">Đang chờ</option>
                        <option value="failed">Thất bại</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    Lưu nhật ký
                  </button>
                </form>
              </div>

              {/* History List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-3">Lịch sử sửa chữa</h3>
                {maintenanceHistory.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 italic text-gray-400">
                    Chưa có bản ghi bảo trì nào cho thiết bị này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maintenanceHistory.map(log => (
                      <div key={log._id} className="p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow bg-white group relative">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{log.description}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${log.status === 'completed' ? 'bg-green-100 text-green-700' :
                              log.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {
                              log.status === 'completed' ? 'Hoàn thành' :
                                log.status === 'pending' ? 'Đang chờ' : 'Thất bại'
                            }
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-[11px] text-gray-500">
                          <div>
                            <p className="font-bold text-gray-400 uppercase">Kỹ thuật viên</p>
                            <p className="text-gray-700 font-medium">{log.technician}</p>
                          </div>
                          <div>
                            <p className="font-bold text-gray-400 uppercase">Chi phí</p>
                            <p className="text-brand-600 font-bold">{Number(log.cost).toLocaleString('vi-VN')} VNĐ</p>
                          </div>
                          <div>
                            <p className="font-bold text-gray-400 uppercase">Ngày</p>
                            <p className="text-gray-700">{new Date(log.maintenance_date).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal with Slider */}
      {showReturnModal && returnRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[120] backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 via-blue-500 to-indigo-500"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Kiểm tra trả thiết bị</h2>
                <p className="text-sm text-gray-500 font-medium">Bản ghi: <span className="text-brand-600">#{returnRecord._id.slice(-6).toUpperCase()}</span></p>
              </div>
              <button onClick={() => setShowReturnModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-6">
              {/* Info summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-brand-600 shadow-sm">
                  <MonitorPlay size={24} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{returnRecord.equipment_id?.name}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{returnRecord.user_id?.fullname} • {returnRecord.user_id?.student_id}</p>
                </div>
              </div>

              {/* Condition Score Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Độ mới / Tốt hiện tại</label>
                  <span className={`text-lg font-black px-3 py-1 rounded-xl shadow-sm ${returnScore > 80 ? 'bg-green-50 text-green-600' :
                      returnScore > 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {returnScore}%
                  </span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={returnScore}
                    onChange={e => setReturnScore(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <div className="flex justify-between mt-2 px-1 text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    <span>0% (Hỏng nát)</span>
                    <span>50% (Khá)</span>
                    <span>100% (Như mới)</span>
                  </div>
                </div>
              </div>

              {/* Condition Dropdown */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Tình trạng chung</label>
                  <select
                    value={returnCondition}
                    onChange={e => setReturnCondition(e.target.value)}
                    className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 bg-gray-50/50 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  >
                    <option value="Bình thường">✅ Bình thường</option>
                    <option value="Trầy xước">⚠️ Trầy xước / Móp méo</option>
                    <option value="Hỏng hóc">❌ Hỏng hóc (Cần bảo trì)</option>
                    <option value="Mất">🚫 Mất thiết bị / Linh kiện</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 text-gray-400">Ghi chú chi tiết (nếu có)</label>
                  <textarea
                    placeholder="Ví dụ: Pin yếu hơn trước, màn hình có điểm chết..."
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                    className="w-full rounded-2xl border-gray-200 px-4 py-3 text-sm bg-gray-50/50 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowReturnModal(false)} className="flex-1 py-4 px-6 rounded-2xl bg-gray-50 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-all active:scale-95">Hủy</button>
                <button
                  onClick={() => handleConfirmReturn(returnRecord._id)}
                  className="flex-[2] py-4 px-6 rounded-2xl bg-brand-600 text-white font-black text-sm shadow-xl shadow-brand-500/30 hover:bg-brand-700 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Xác nhận duyệt trả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedEqIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 z-[90] animate-in slide-in-from-bottom-4 duration-300 border border-white/10 backdrop-blur-xl">
          <div className="flex flex-col">
            <span className="text-sm font-bold">{selectedEqIds.length} thiết bị đã chọn</span>
            <button onClick={() => setSelectedEqIds([])} className="text-[10px] text-gray-400 hover:text-white underline text-left">Bỏ chọn tất cả</button>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleBulkUpdateStatus('available')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-xs font-bold transition-colors">Sẵn sàng</button>
            <button onClick={() => handleBulkUpdateStatus('maintenance')} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-xl text-xs font-bold transition-colors">Bảo trì</button>
            <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold transition-colors">Xóa sạch</button>
          </div>
        </div>
      )}
      </div>

      {/* Quick Add User Modal */}
      {showQuickAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowQuickAddUser(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-brand-100 p-2.5 rounded-xl"><UserPlus size={22} className="text-brand-600" strokeWidth={2.5} /></div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Thêm tài khoản</h2>
                  <p className="text-xs text-brand-600 font-medium mt-0.5">Nhanh chóng thiết lập sinh viên mới trên hệ thống</p>
                </div>
              </div>
              <button onClick={() => setShowQuickAddUser(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <div className="flex border-b border-gray-100 text-sm">
              <button
                className={`flex-1 py-3.5 font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${quickAddTab === 'manual' ? 'border-brand-500 text-brand-600 bg-brand-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => { setQuickAddTab('manual'); setImportResult(null); }}
              >
                <Plus size={16} /> Tạo Thủ Công
              </button>
              <button
                className={`flex-1 py-3.5 font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${quickAddTab === 'excel' ? 'border-green-500 text-green-600 bg-green-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => { setQuickAddTab('excel'); setCreateError(''); }}
              >
                <FileUp size={16} /> Nhập từ Excel
              </button>
            </div>

            <div className="p-6">
              {quickAddTab === 'manual' ? (
                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                  {createError && (
                    <div className={`px-4 py-3 rounded-xl text-sm flex items-start gap-2 font-medium ${createError.includes('thành công') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                      <span className="mt-0.5">{createError.includes('thành công') ? '✅' : '⚠️'}</span> {createError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Họ và Tên</label>
                    <input type="text" value={createForm.fullname} onChange={e => setCreateForm({ ...createForm, fullname: e.target.value })}
                      placeholder="VD: Nguyễn Văn Sinh" required
                      className="w-full border-2 border-gray-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-gray-50/50 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-400 font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mã sinh viên (Tài khoản)</label>
                    <input type="text" value={createForm.student_id} onChange={e => setCreateForm({ ...createForm, student_id: e.target.value })}
                      placeholder="VD: sv001" required
                      className="w-full border-2 border-gray-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all placeholder-gray-400 font-bold text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mật khẩu</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={createForm.password}
                        onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                        placeholder="Có thể dùng MSSV làm mật khẩu" required
                        className="w-full border-2 border-gray-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-gray-50/50 rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all font-medium" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors p-1">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={createLoading}
                    className={`w-full mt-2 py-3.5 rounded-xl text-white font-black transition-all uppercase tracking-widest text-sm flex justify-center items-center gap-2 ${createLoading ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/20 active:scale-[0.98]'}`}>
                    {createLoading ? 'Đang xử lý...' : <><Plus size={18} strokeWidth={3} /> Xác Nhận Tạo</>}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                    <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-green-800">
                      <p className="font-bold mb-1">Hướng dẫn nhập hàng loạt:</p>
                      <ul className="list-disc pl-4 space-y-1 opacity-90 text-xs font-medium">
                        <li>Dữ liệu bắt buộc: <b>Họ và Tên</b>, <b>Mã Sinh Viên / MSNV</b>.</li>
                        <li>Nếu không có cột <b>Mật khẩu</b>, hệ thống tự động đặt `123456`.</li>
                      </ul>
                      <button onClick={handleDownloadTemplate} className="mt-3 text-xs font-bold bg-white text-green-700 px-3 py-1.5 rounded shadow-sm border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1.5 w-fit">
                        <FileDown size={14} /> Tải file mẫu
                      </button>
                    </div>
                  </div>

                  {importResult && (
                    <div className={`p-4 rounded-xl border text-sm font-medium ${importResult.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      <div className="flex gap-2 items-start">
                        {importResult.type === 'success' ? <CheckCircle size={18} className="mt-0.5 text-green-600" /> : <AlertCircle size={18} className="mt-0.5 text-red-500" />}
                        <div className="flex-1">
                          <p className="font-bold">{importResult.message}</p>
                          {importResult.errors?.length > 0 && (
                            <div className="mt-2 text-xs opacity-80 max-h-24 overflow-y-auto space-y-1 custom-scrollbar">
                              {importResult.errors.map((e, i) => <p key={i}>• {e}</p>)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-green-400 hover:bg-green-50/30 transition-all group flex flex-col items-center cursor-pointer"
                    onClick={() => !importLoading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleImportUserFile}
                      disabled={importLoading}
                    />
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-green-200 transition-all">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">{importLoading ? 'Đang xử lý dữ liệu...' : 'Click hoặc kéo thả file Excel'}</p>
                    <p className="text-xs font-medium text-gray-500">Hỗ trợ .xlsx, .xls</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
