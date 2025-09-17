import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Grid from '../../components/Grid';

type Device = {
    _id: string;
    name: string;
    type: string;
    status: string;
    location: string;
};

export default function DeviceDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchDevice = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`http://localhost:3000/api/devices/${id}`);
                if (!res.ok) throw new Error(`Failed to fetch device: ${res.status}`);
                const data = await res.json();
                const item: Device | undefined = (data.device || data);
                setDevice(item ?? null);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchDevice();
    }, [id]);

    return (
        <div className="min-h-screen bg-white">
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-4">
                    <Link href="/devices" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">&larr; Quay lại danh sách</Link>
                </div>

                {loading && <p className="text-slate-500">Đang tải...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && !device && <p className="text-slate-500">Không tìm thấy thiết bị</p>}

                {device && (
                    <Grid className="w-[80vw] mx-auto">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                            <div className="h-56 bg-slate-100" />
                            <div className="p-5">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-sky-600 font-medium">{device.type}</span>
                                    <span className="text-slate-500">{device.status}</span>
                                </div>
                                <h1 className="text-xl font-semibold text-slate-900">{device.name}</h1>
                                <div className="mt-2 text-slate-500 text-sm flex flex-wrap gap-x-6 gap-y-1">
                                    <span>Vị trí: {device.location}</span>
                                    <span>Mã thiết bị: {device._id}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <Link href="/devices" className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-black">Về danh sách</Link>
                                    <button className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Mượn ngay</button>
                                </div>
                            </div>
                        </div>
                    </Grid>
                )}
            </section>
        </div>
    );
}


