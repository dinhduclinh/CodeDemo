import Link from 'next/link';
import Grid from '../components/Grid';

export default function Home() {
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

        <Grid>
          {mockDevices.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
              <div className="h-40 bg-slate-100" />
              <div className="p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-sky-600 font-medium">{d.tag}</span>
                  <span className="text-slate-500">{d.badge}</span>
                </div>
                <h3 className="text-slate-900 font-semibold line-clamp-1">{d.title}</h3>
                <div className="mt-2 text-slate-500 text-xs flex flex-wrap gap-x-4 gap-y-1">
                  <span>Quản lý: {d.manager}</span>
                  <span>Kho: {d.store}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-xs">Giá mỗi ngày</div>
                    <div className="text-base font-bold text-slate-900">{d.price}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/devices/${d.id}`} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg">Xem chi tiết</Link>
                    <button className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Mượn ngay</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Grid>
      </section>
    </div>
  );
}

const mockDevices = [
  { id: '1', tag: 'Đề xuất', badge: 'Có sẵn', title: 'MacBook Pro 16" M3 2024', manager: 'Quản trị K. Toán', store: 'Kho 2', price: '300,000đ' },
  { id: '2', tag: 'Máy ảnh', badge: 'Còn hàng', title: 'Canon EOS R5 + Lens 24-70mm', manager: 'Quản trị K. CNTT', store: 'Kho 4', price: '500,000đ' },
  { id: '3', tag: 'Điện thoại', badge: 'Có sẵn', title: 'iPhone 15 Pro Max 256GB', manager: 'Quản trị K. Điện', store: 'Kho 1', price: '150,000đ' },
  { id: '4', tag: 'Âm thanh', badge: 'Có sẵn', title: 'Sony WH-1000XM5 Wireless', manager: 'Quản trị K. Điện tử', store: 'Kho 3', price: '50,000đ' },
  { id: '5', tag: 'Máy tính bảng', badge: 'Còn hàng', title: 'iPad Pro 12.9" + Apple Pencil', manager: 'Quản trị K. Thiết kế', store: 'Kho 5', price: '200,000đ' },
  { id: '6', tag: 'Thiết bị khác', badge: 'Có sẵn', title: 'PlayStation 5 + 2 Controllers', manager: 'Quản trị CLB', store: 'Kho 6', price: '100,000đ' },
];
