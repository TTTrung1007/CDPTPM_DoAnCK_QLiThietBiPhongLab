import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Printer, QrCode, CheckSquare, Square } from 'lucide-react';

const PrintQR = () => {
  const { user } = useContext(AuthContext);
  const [equipments, setEquipments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/equipment', config);
        setEquipments(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchEquipments();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.length === equipments.length ? [] : equipments.map(eq => eq._id));
  };

  // Inject print CSS: chỉ render #print-area, ẩn mọi thứ khác
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'qr-print-style';
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #qr-print-portal { display: block !important; position: fixed; inset: 0; background: white; z-index: 99999; }
        @page { size: A4 portrait; margin: 8mm; }
        .qr-label-card { break-inside: avoid; page-break-inside: avoid; }
        img { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
      #qr-print-portal { display: none; }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('qr-print-style');
      if (el) el.remove();
      const portal = document.getElementById('qr-print-portal');
      if (portal) portal.remove();
    };
  }, []);

  const handlePrint = () => {
    // Tạo/cập nhật portal print ngoài React tree để không bị ảnh hưởng bởi class no-print
    let portal = document.getElementById('qr-print-portal');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'qr-print-portal';
      document.body.appendChild(portal);
    }

    const selected = equipments.filter(eq => selectedIds.includes(eq._id));

    portal.innerHTML = `
      <div style="padding: 6mm; background: white; font-family: sans-serif;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm;">
          ${selected.map(eq => `
            <div class="qr-label-card" style="border: 2px solid #111; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; align-items: center; background: white;">
              <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; text-align: center; width: 100%; border-bottom: 2px solid #111; padding-bottom: 4px; margin-bottom: 4px; letter-spacing: 1px;">PTN LAB CNTT</div>
              <img src="${eq.qr_code_url}" alt="QR" style="width: 90px; height: 90px; display: block; margin: 4px auto;" crossorigin="anonymous" />
              <div style="text-align: center; margin-top: 4px; width: 100%;">
                <p style="font-size: 11px; font-weight: 700; color: #000; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${eq.name}</p>
                <p style="font-size: 9px; font-family: monospace; color: #444; margin: 2px 0 0; font-weight: 700;">SN: ${eq.serial_number}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  };

  const selectedEquipments = equipments.filter(eq => selectedIds.includes(eq._id));

  if (loading) return (
    <div className="flex justify-center my-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-600 p-3 rounded-xl shadow-lg shadow-cyan-600/20">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">In Tem QR Code</h1>
            <p className="text-sm text-gray-500 mt-1">Chọn các thiết bị bên dưới để xếp vào biểu mẫu A4 và đem in ấn.</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={selectedIds.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
            ${selectedIds.length > 0 ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
        >
          <Printer size={20} /> IN {selectedIds.length} TEM
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Danh sách thiết bị */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm max-h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <div className="font-semibold text-gray-800">Kho Thiết bị</div>
            <button onClick={selectAll} className="text-sm text-brand-600 hover:text-brand-800 font-medium">
              {selectedIds.length === equipments.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
            </button>
          </div>
          <div className="overflow-y-auto p-2 flex-1">
            {equipments.map(eq => (
              <div
                key={eq._id}
                onClick={() => toggleSelect(eq._id)}
                className={`p-3 rounded-xl cursor-pointer mb-1 border-2 transition-colors flex items-center gap-3
                  ${selectedIds.includes(eq._id) ? 'border-brand-500 bg-brand-50' : 'border-transparent hover:bg-gray-50'}`}
              >
                {selectedIds.includes(eq._id)
                  ? <CheckSquare className="text-brand-600 shrink-0" size={20} />
                  : <Square className="text-gray-400 shrink-0" size={20} />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{eq.name}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">{eq.serial_number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview khu vực in */}
        <div className="lg:col-span-3 bg-gray-200 rounded-2xl p-4 sm:p-8 overflow-auto shadow-inner border border-gray-300" style={{ minHeight: '600px' }}>
          <div className="bg-white shadow-2xl mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}>
            {selectedEquipments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-32">
                <QrCode size={64} className="mb-4 opacity-20" />
                <p className="text-lg">Chưa chọn thiết bị nào để in.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {selectedEquipments.map((eq, index) => (
                  <div key={index} className="border-2 border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center">
                    <div className="font-extrabold text-sm uppercase text-gray-900 text-center mb-1 w-full truncate border-b-2 border-gray-800 pb-1 tracking-wider">
                      PTN LAB CNTT
                    </div>
                    {/* Bỏ mix-blend-multiply - đây là nguyên nhân mã QR bị mất khi in */}
                    <img
                      src={eq.qr_code_url}
                      alt="QR"
                      className="w-28 h-28 object-contain my-1"
                    />
                    <div className="w-full text-center mt-1">
                      <p className="text-xs font-bold text-black truncate leading-tight">{eq.name}</p>
                      <p className="text-[10px] font-mono text-gray-700 font-bold mt-0.5">SN: {eq.serial_number}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintQR;
