import Link from 'next/link';
import Grid from '../components/Grid';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Popup from '../components/Popup';

type Device = {
  _id: string;
  name: string;
  type: string;
  status: string;
  location: string;
};


export default function Home() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [borrowingDeviceId, setBorrowingDeviceId] = useState<string | null>(null);
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:9999/api/devices/`);
        if (!res.ok) throw new Error(`Failed to fetch devices: ${res.status}`);
        const data = await res.json();
        const list: Device[] = data.devices || data || [];
        setDevices(list);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      };
    };
    fetchDevices();
  }, []);

  const handleBorrowDevice = async (deviceId: string, deviceStatus: string) => {
    if (!user) {
      setPopup({
        isOpen: true,
        title: 'Chưa đăng nhập',
        message: 'Vui lòng đăng nhập để mượn thiết bị.',
        type: 'warning'
      });
      return;
    }

    if (deviceStatus === 'borrowed') {
      setPopup({
        isOpen: true,
        title: 'Thiết bị đã được mượn',
        message: 'Thiết bị này đã được mượn bởi người khác.',
        type: 'error'
      });
      return;
    }

    try {
      setBorrowingDeviceId(deviceId);
      
      const response = await fetch('http://localhost:9999/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: deviceId,
          userId: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Cập nhật trạng thái thiết bị trong danh sách
        setDevices(prevDevices => 
          prevDevices.map(device => 
            device._id === deviceId 
              ? { ...device, status: 'borrowed' }
              : device
          )
        );

        setPopup({
          isOpen: true,
          title: 'Mượn thiết bị thành công',
          message: `Bạn đã mượn thiết bị thành công. Mã mượn: ${data.borrowing._id.slice(-8)}`,
          type: 'success'
        });
      } else {
        setPopup({
          isOpen: true,
          title: 'Lỗi mượn thiết bị',
          message: data.message || 'Có lỗi xảy ra khi mượn thiết bị.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error borrowing device:', error);
      setPopup({
        isOpen: true,
        title: 'Lỗi mượn thiết bị',
        message: 'Có lỗi xảy ra khi mượn thiết bị. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setBorrowingDeviceId(null);
    }
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider bg-white/15 w-fit px-2 py-1 rounded-md mb-3">
              Thuê mượn thiết bị nhanh
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Mượn thiết bị dễ dàng & nhanh chóng
            </h1>
            <p className="text-white/90 mt-3">
              Hệ thống cho phép đặt lịch mượn thiết bị hiện đại, tiện lợi và đáng tin cậy. Tìm kiếm nhanh theo danh mục và trạng thái.
            </p>

            {/* Search */}
            <div className="mt-6 bg-white rounded-xl p-2 flex items-center gap-2 shadow-lg">
              <input
                type="text"
                placeholder="Tìm laptop, camera, mic, ..."
                className="flex-1 outline-none px-3 py-2 rounded-md text-slate-700"
              />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">
                Tìm kiếm
              </button>
            </div>

            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { label: 'Laptop', icon: '💻' },
                { label: 'Điện thoại', icon: '📱' },
                { label: 'Camera', icon: '📷' },
                { label: 'Thiết bị khác', icon: '🎧' },
              ].map((c) => (
                <button key={c.label} className="flex items-center gap-2 bg-white/15 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm">
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="aspect-video rounded-2xl bg-white/10 border border-white/20" />
            <div className="mt-3 text-xs text-white/80">20+ thiết bị đang có sẵn</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'Thiết bị đã cho mượn' },
            { value: '1,200+', label: 'Người dùng' },
            { value: '5,000+', label: 'Lượt mượn' },
            { value: '4.9/5', label: 'Đánh giá' },
          ].map((s) => (
            <div key={s.label} className="">
              <div className="text-xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Thiết bị nổi bật</h2>
          <Link href="/devices" className="text-sm text-indigo-600 hover:text-indigo-700">Xem tất cả</Link>
        </div>

        {loading && <p className="text-slate-500 text-center py-8">Đang tải...</p>}
        {error && <p className="text-red-600 text-center py-8">{error}</p>}
        
        {!loading && !error && (
          <Grid>
            {devices.map((d) => (
            <div key={d._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
              <div className="h-40 bg-slate-100" />
              <div className="p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-sky-600 font-medium">{d.type}</span>
                  <span className="text-slate-500">{d.status}</span>
                </div>
                <h3 className="text-slate-900 font-semibold line-clamp-1">{d.name}</h3>
                <div className="mt-2 text-slate-500 text-xs flex flex-wrap gap-x-4 gap-y-1">
                  <span>Quản lý: {d.location}</span>
                  <span>Kho: {d.location}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {/* <div className="text-slate-500 text-xs">Giá mỗi ngày</div>
                    <div className="text-base font-bold text-slate-900">{d.price}</div> */}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/devices/${d._id}`} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-black">Xem chi tiết</Link>
                    <button 
                      onClick={() => handleBorrowDevice(d._id, d.status)}
                      disabled={d.status === 'borrowed' || borrowingDeviceId === d._id}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        d.status === 'borrowed' 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : borrowingDeviceId === d._id
                          ? 'bg-indigo-400 text-white cursor-wait'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {borrowingDeviceId === d._id ? 'Đang mượn...' : 
                       d.status === 'borrowed' ? 'Đã mượn' : 'Mượn ngay'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </Grid>
        )}
      </section>
      
      {/* Popup Component */}
      <Popup
        isOpen={popup.isOpen}
        onClose={closePopup}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
}
