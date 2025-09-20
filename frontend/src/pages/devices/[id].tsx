import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Popup from '../../components/Popup';

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
    const { user } = useAuth();

    const [device, setDevice] = useState<Device | null>(null);
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
    const [isBorrowing, setIsBorrowing] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;
        const fetchDevice = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`http://localhost:9999/api/devices/${id}`);
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

    const handleBorrowDevice = async () => {
        if (!user) {
            setPopup({
                isOpen: true,
                title: 'Chưa đăng nhập',
                message: 'Vui lòng đăng nhập để mượn thiết bị.',
                type: 'warning'
            });
            return;
        }

        if (!device) return;

        if (device.status === 'borrowed') {
            setPopup({
                isOpen: true,
                title: 'Thiết bị đã được mượn',
                message: 'Thiết bị này đã được mượn bởi người khác.',
                type: 'error'
            });
            return;
        }

        try {
            setIsBorrowing(true);
            
            const response = await fetch('http://localhost:9999/api/borrowings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceId: device._id,
                    userId: user.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Cập nhật trạng thái thiết bị
                setDevice(prev => prev ? { ...prev, status: 'borrowed' } : null);

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
            setIsBorrowing(false);
        }
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <Link href="/devices" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại danh sách thiết bị
                    </Link>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải thông tin thiết bị...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Lỗi tải dữ liệu
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Not Found State */}
                {!loading && !error && !device && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <span className="text-6xl">📱</span>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy thiết bị</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Thiết bị bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/devices"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Về danh sách thiết bị
                            </Link>
                        </div>
                    </div>
                )}

                {/* Device Detail */}
                {device && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                            {/* Left Side - Device Image */}
                            <div className="space-y-4">
                                <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-4xl font-bold text-indigo-600">
                                                    {device.type.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-lg font-medium text-gray-700">{device.type}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="flex justify-center">
                                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                                        device.status === 'available' 
                                            ? 'bg-green-100 text-green-800' 
                                            : device.status === 'borrowed'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                            device.status === 'available' 
                                                ? 'bg-green-400' 
                                                : device.status === 'borrowed'
                                                ? 'bg-red-400'
                                                : 'bg-yellow-400'
                                        }`}></div>
                                        {device.status === 'available' ? 'Có sẵn' : 
                                         device.status === 'borrowed' ? 'Đã mượn' : 
                                         device.status}
                                    </span>
                                </div>
                            </div>

                            {/* Right Side - Device Info */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{device.name}</h1>
                                    <p className="text-lg text-gray-600">Thiết bị {device.type}</p>
                                </div>

                                {/* Device Details */}
                                <div className="space-y-4">
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chi tiết</h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-500">Loại thiết bị</span>
                                                <span className="text-sm text-gray-900">{device.type}</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-500">Vị trí</span>
                                                <span className="text-sm text-gray-900">{device.location}</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-500">Mã thiết bị</span>
                                                <span className="text-sm font-mono text-gray-900">{device._id}</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                                                <span className={`text-sm font-medium ${
                                                    device.status === 'available' 
                                                        ? 'text-green-600' 
                                                        : device.status === 'borrowed'
                                                        ? 'text-red-600'
                                                        : 'text-yellow-600'
                                                }`}>
                                                    {device.status === 'available' ? 'Có sẵn' : 
                                                     device.status === 'borrowed' ? 'Đã mượn' : 
                                                     device.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link
                                            href="/devices"
                                            className="flex-1 px-6 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Về danh sách
                                        </Link>
                                        
                                        {device.status === 'available' ? (
                                            <button 
                                                onClick={handleBorrowDevice}
                                                disabled={isBorrowing}
                                                className={`flex-1 px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                    isBorrowing 
                                                        ? 'bg-indigo-400 cursor-wait' 
                                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                                }`}
                                            >
                                                {isBorrowing ? 'Đang mượn...' : 'Mượn ngay'}
                                            </button>
                                        ) : (
                                            <button 
                                                disabled
                                                className="flex-1 px-6 py-3 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                                            >
                                                {device.status === 'borrowed' ? 'Đã được mượn' : 'Không khả dụng'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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


