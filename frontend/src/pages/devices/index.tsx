import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Grid from '../../components/Grid';

type Device = {
    _id: string;
    name: string;
    type: string;
    status: string;
    location: string;
};


export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [nameFilter, setNameFilter] = useState<string>('all');

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`http://localhost:3000/api/devices/`);
                if (!res.ok) throw new Error(`Failed to fetch devices: ${res.status}`);
                const data = await res.json();
                const list: Device[] = data.devices || data || [];
                setDevices(list);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    const uniqueStatuses = useMemo(() => {
        return Array.from(new Set(devices.map((d) => d.status))).filter(Boolean);
    }, [devices]);

    const uniqueNames = useMemo(() => {
        return Array.from(new Set(devices.map((d) => d.name))).filter(Boolean);
    }, [devices]);

    const filteredDevices = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return devices.filter((d) => {
            const matchesSearch = q === '' || d.name.toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
            const matchesName = nameFilter === 'all' || d.name === nameFilter;
            return matchesSearch && matchesStatus && matchesName;
        });
    }, [devices, searchQuery, statusFilter, nameFilter]);

    return (
        <div className="min-h-screen bg-white">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-semibold text-slate-900">Danh sách thiết bị</h1>
                </div>

                <div className="bg-white rounded-xl pl-3 pr-2 py-2 flex items-center gap-2 shadow-sm border border-slate-200 mb-4 focus-within:ring-2 focus-within:ring-indigo-500" role="search" aria-label="Tìm kiếm thiết bị">
                    <span className="text-slate-400" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên thiết bị..."
                        className="flex-1 bg-transparent outline-none px-1 py-1 text-slate-700 placeholder-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <label className="text-slate-600">Trạng thái</label>
                            <select
                                className="border rounded-md px-2 py-1 text-slate-700"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                {uniqueStatuses.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <label className="text-slate-600">Tên</label>
                            <select
                                className="border rounded-md px-2 py-1 text-slate-700 max-w-[200px]"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                {uniqueNames.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading && <p className="text-slate-500">Đang tải...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {!loading && !error && (
                    <Grid>
                        {filteredDevices.map((d) => (
                            <div key={d._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                                <div className="h-40 bg-slate-100" />
                                <div className="p-4">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-sky-600 font-medium">{d.type}</span>
                                        <span className="text-slate-500">{d.status}</span>
                                    </div>
                                    <h3 className="text-slate-900 font-semibold line-clamp-1">{d.name}</h3>
                                    <div className="mt-2 text-slate-500 text-xs flex flex-wrap gap-x-4 gap-y-1">
                                        <span>Vị trí: {d.location}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div>
                                            <div className="text-slate-500 text-xs">Mã thiết bị</div>
                                            <div className="text-base font-bold text-slate-900">{d._id}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/devices/${d._id}`} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-black">Xem chi tiết</Link>
                                            <button className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Mượn ngay</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Grid>
                )}
            </section>
        </div>
    );
}


