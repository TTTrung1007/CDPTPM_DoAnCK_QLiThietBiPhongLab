import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import jsQR from 'jsqr';
import { ScanLine, UploadCloud, Image as ImageIcon, Download, Trash2, Link as LinkIcon, Copy } from 'lucide-react';

const QRScanner = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'camera'
  const [scannedItems, setScannedItems] = useState([]);
  const [beepEnabled, setBeepEnabled] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('scannedItems');
    if (saved) {
      setScannedItems(JSON.parse(saved));
    }
  }, []);

  const saveItems = (items) => {
    setScannedItems(items);
    localStorage.setItem('scannedItems', JSON.stringify(items));
  };

  const playBeep = () => {
    if (!beepEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.1;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
  };

  const addScannedItem = (text) => {
    // Avoid rapid duplicates
    if (scannedItems.length > 0 && scannedItems[0].url === text && (Date.now() - scannedItems[0].timestamp < 3000)) return;

    playBeep();
    const newItem = {
      id: Date.now().toString(),
      url: text,
      timestamp: Date.now()
    };
    saveItems([newItem, ...scannedItems]);
  };

  const scanFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        // Phủ nền trắng tránh lỗi trong suốt
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          addScannedItem(code.data);
          setActiveTab('upload'); // Tự động nhảy sang tab Tải lên để xem danh sách nếu đang ở Camera
        } else {
          alert("Không tìm thấy mã QR trong hình ảnh. Vui lòng thử ảnh khác sắc nét hơn.");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    scanFile(e.target.files[0]);
    e.target.value = '';
  };

  // Handle Ctrl+V / Cmd+V to paste image globally
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          scanFile(file);
          break;
        }
      }
    };
    // Đính vào window để có thể copy ở trang nào bấn ctrl V hệ thống nhảy tự động luôn 
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [scannedItems]); // update when scannedItems changes so it doesn't use stale state

  const handleResult = (result, error) => {
    if (result) {
      addScannedItem(result.text);
    }
  };

  const deleteItem = (id) => {
    saveItems(scannedItems.filter(i => i.id !== id));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleLinkClick = (e, targetUrl) => {
    e.preventDefault();
    try {
      const url = new URL(targetUrl);
      if (url.pathname.startsWith('/equipment/')) {
        navigate(url.pathname);
      } else {
        window.open(targetUrl, '_blank');
      }
    } catch (err) {
      if (targetUrl.startsWith('/equipment/')) {
        navigate(targetUrl);
      } else {
        alert("Dữ liệu không phải là một liên kết hợp lệ.");
      }
    }
  };

  return (
    <div className="bg-[#18191c] -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 px-4 sm:px-6 lg:px-12 py-8 sm:py-12 min-h-[calc(100vh-64px)] text-gray-200 font-sans">
      <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10 tracking-tight">Quét mã QR</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel */}
        <div className="lg:col-span-4 bg-[#1e2024] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 bg-[#151618]">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors ${activeTab === 'upload' ? 'bg-[#1e2024] text-white border-t-2 border-t-blue-500 border-x border-x-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <UploadCloud size={16} /> Tải lên
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors ${activeTab === 'camera' ? 'bg-[#1e2024] text-white border-t-2 border-t-blue-500 border-x border-x-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <ScanLine size={16} /> Quét qua Camera
            </button>
          </div>

          {/* Content Box */}
          <div className="p-4 sm:p-6 bg-[#1e2024]">
            {activeTab === 'upload' ? (
              <div
                className="h-80 border-2 border-dashed border-gray-700/80 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-[#1a1c20]"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 bg-[#23252a] rounded-full mb-4 shadow-sm border border-gray-800">
                  <ImageIcon size={36} className="text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-2 font-medium">Bấm để tải ảnh lên hệ thống</p>
                <p className="text-gray-500 text-xs mb-6 font-medium">(Hoặc bấm <kbd className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700 text-gray-300">Ctrl/Cmd + V</kbd> ở bất kỳ đâu trên màn hình)</p>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-blue-900/30">
                  Tải lên <UploadCloud size={16} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <div className="h-80 rounded-2xl overflow-hidden bg-black relative shadow-inner border border-gray-800">
                <QrReader
                  onResult={handleResult}
                  constraints={{ facingMode: 'environment' }}
                  videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  containerStyle={{ width: '100%', height: '100%', padding: 0 }}
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border border-white/20 rounded-2xl relative shadow-[0_0_0_999px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 -mt-0.5 -ml-0.5 rounded-tl-xl transition-all"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 -mt-0.5 -mr-0.5 rounded-tr-xl transition-all"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 -mb-0.5 -ml-0.5 rounded-bl-xl transition-all"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 -mb-0.5 -mr-0.5 rounded-br-xl transition-all"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-8 bg-[#151618] rounded-xl border border-gray-800 shadow-2xl flex flex-col h-[500px]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 rounded-t-xl bg-[#151618]">
            <h2 className="text-white text-base font-semibold uppercase tracking-wider">
              CÁC MỤC ĐƯỢC QUÉT({scannedItems.length})
            </h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => setBeepEnabled(!beepEnabled)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Tiếng bíp
                <div className={`w-9 h-4 sm:w-10 sm:h-5 rounded-full relative transition-colors ${beepEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white transition-all shadow-sm ${beepEnabled ? 'left-[18px] sm:left-5' : 'left-0.5'}`}></div>
                </div>
              </button>

              <button
                onClick={() => {
                  const text = scannedItems.map(i => i.url).join('\n');
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'DanhSachQuet.txt';
                  a.click();
                }}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 transition-colors font-medium border border-blue-400/20 px-3 py-1.5 rounded"
              >
                <Download size={14} /> Tải xuống tất cả
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa tất cả danh sách đã quét?')) saveItems([]);
                }}
                className="bg-red-600 font-semibold text-white text-sm px-3 py-1.5 rounded hover:bg-red-700 flex items-center gap-1.5 shadow-sm transition-all shadow-red-900/20 border border-red-500/50"
              >
                <Trash2 size={14} /> Xóa tất cả
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4 px-5 py-3 border-b border-gray-800 text-xs text-gray-500 font-medium">
            <div className="col-span-2 sm:col-span-1">Không</div>
            <div className="col-span-8 sm:col-span-9">Results</div>
            <div className="col-span-2 text-right">Danh sách <span className="border border-gray-700 rounded px-1.5 py-0.5 ml-1">50</span></div>
          </div>

          {/* List Content */}
          <div className="flex-1 p-2 sm:p-3 overflow-y-auto min-h-0 bg-[#1a1c20] rounded-b-xl">
            {scannedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <ScanLine size={40} className="mb-3 opacity-20" />
                <p className="text-sm">Chưa có mục nào được quét.</p>
              </div>
            ) : (
              scannedItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-[#23252a] rounded-lg group transition-colors border-b border-gray-800/40 last:border-0 border-t border-t-white/5">
                  <div className="w-5 sm:w-6 text-gray-500 font-mono text-sm pl-1">{index + 1}</div>

                  <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
                    <div className="bg-[#1e2638] border border-blue-500/20 p-1.5 rounded-full shrink-0">
                      <LinkIcon className="text-blue-500" size={14} />
                    </div>
                    <span className="text-blue-400 text-xs sm:text-sm font-semibold shrink-0 hidden sm:inline tracking-wide">URL:</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-300 text-sm hover:underline hover:text-white truncate transition-colors"
                      onClick={(e) => handleLinkClick(e, item.url)}
                    >
                      {item.url}
                    </a>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 shrink-0 pr-1">
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-500 hidden sm:inline">THÔ</span>
                    <button
                      onClick={() => copyToClipboard(item.url)}
                      className="text-gray-500 hover:text-gray-200 transition-colors p-1"
                      title="Sao chép"
                    ><Copy size={16} /></button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-1"
                      title="Xóa"
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
