import Link from 'next/link';
import { useEffect, useState } from 'react';
import Grid from '../../components/Grid';

type Borrowing = {
    _id: string;
    device: {
        id: string;
        name: string;
        type: string;
        status: string;
        location: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
    };
    borrowDate: string;
    status: string;
};

export default function BorrowingsPage() {
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBorrowings = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`http://localhost:9999/api/borrowings/`);
                if (!res.ok) throw new Error(`Failed to fetch borrowings: ${res.status}`);
                const data = await res.json();
                const list: Borrowing[] = data.borrowings || data || [];
                setBorrowings(list);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchBorrowings();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-semibold text-slate-900">Danh sách mượn thiết bị</h1>
                </div>

                {loading && <p className="text-slate-500">Đang tải...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {!loading && !error && (
                    <Grid>
                        {borrowings.map((b) => (
                            <div key={b._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group p-4">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-sky-600 font-medium">Borrowing</span>
                                    <span className="text-slate-500">{b.status}</span>
                                </div>
                                <h3 className="text-slate-900 font-semibold">Mã mượn: {b._id}</h3>
                                <div className="mt-2 text-slate-500 text-xs flex flex-col gap-y-1">
                                    <span>Thiết bị: {b.device.name}</span>
                                    <span>Người mượn: {b.user.name}</span>
                                    <span>Ngày mượn: {new Date(b.borrowDate).toLocaleString()}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-end">
                                    <Link href={`/devices/${b.device.id}`} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-black">Xem thiết bị</Link>
                                </div>
                            </div>
                        ))}
                    </Grid>
                )}
            </section>
        </div>
    );
}