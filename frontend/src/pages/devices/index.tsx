import Link from 'next/link';
import { useEffect, useState } from 'react';
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

    return (
        <div className="min-h-screen bg-white">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-semibold text-slate-900">Danh sách thiết bị</h1>
                </div>

                {loading && <p className="text-slate-500">Đang tải...</p>}
                {error && <p className="text-red-600">{error}</p>}

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


