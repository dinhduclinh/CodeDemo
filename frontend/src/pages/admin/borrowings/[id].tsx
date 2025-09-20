import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Popup from '../../../components/Popup';

type Borrowing = {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    device: {
        _id: string;
        name: string;
        type: string;
        status: string;
    };
    borrowDate: string;
    status?: string;
    __v: number;
};

export default function BorrowingDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();

    const [borrowing, setBorrowing] = useState<Borrowing | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        showActions?: boolean;
        onConfirm?: () => void;
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;
        
        const fetchBorrowing = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const res = await fetch(`http://localhost:9999/api/borrowings/${id}`);
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch borrowing: ${res.status}`);
                }
                
                const data = await res.json();
                console.log('Borrowing API Response:', data);
                
                if (data && data.borrowing) {
                    setBorrowing(data.borrowing);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
                console.error('Error fetching borrowing:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBorrowing();
    }, [id]);

    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        
        switch (status.toLowerCase()) {
            case 'borrowed':
                return 'bg-purple-100 text-purple-800';
            case 'accept':
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'reject':
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancel-pending':
                return 'bg-orange-100 text-orange-800';
            case 'cancel':
                return 'bg-red-100 text-red-800';
            case 'return-pending':
                return 'bg-blue-100 text-blue-800';
            case 'return':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string | undefined) => {
        if (!status) return 'Không xác định';
        
        switch (status.toLowerCase()) {
            case 'borrowed':
                return 'Đã mượn';
            case 'accept':
            case 'accepted':
                return 'Chấp nhận';
            case 'reject':
            case 'rejected':
                return 'Từ chối';
            case 'pending':
                return 'Chờ duyệt';
            case 'cancel-pending':
                return 'Chờ hủy';
            case 'cancel':
                return 'Đã hủy';
            case 'return-pending':
                return 'Chờ trả';
            case 'return':
                return 'Đã trả';
            default:
                return status;
        }
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, isOpen: false }));
    };

    const handleAcceptBorrowing = async () => {
        if (!borrowing) return;
        
        setPopup({
            isOpen: true,
            title: 'Xác nhận duyệt',
            message: `Bạn có chắc chắn muốn duyệt đơn mượn thiết bị "${borrowing.device.name}" của ${borrowing.user.name}?`,
            type: 'warning',
            showActions: true,
            onConfirm: async () => {
                try {
                    setIsProcessing(true);
                    const res = await fetch(`http://localhost:9999/api/borrowings/accept/${borrowing._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!res.ok) {
                        throw new Error(`Failed to accept borrowing: ${res.status}`);
                    }

                    const data = await res.json();
                    setBorrowing(data.borrowing);
                    
                    setPopup({
                        isOpen: true,
                        title: 'Thành công',
                        message: 'Đơn mượn đã được duyệt thành công!',
                        type: 'success'
                    });
                } catch (error) {
                    console.error('Error accepting borrowing:', error);
                    setPopup({
                        isOpen: true,
                        title: 'Lỗi',
                        message: 'Có lỗi xảy ra khi duyệt đơn mượn. Vui lòng thử lại.',
                        type: 'error'
                    });
                } finally {
                    setIsProcessing(false);
                }
            },
            confirmText: 'Duyệt',
            cancelText: 'Hủy'
        });
    };

    const handleRejectBorrowing = async () => {
        if (!borrowing) return;
        
        setPopup({
            isOpen: true,
            title: 'Xác nhận từ chối',
            message: `Bạn có chắc chắn muốn từ chối đơn mượn thiết bị "${borrowing.device.name}" của ${borrowing.user.name}?`,
            type: 'warning',
            showActions: true,
            onConfirm: async () => {
                try {
                    setIsProcessing(true);
                    const res = await fetch(`http://localhost:9999/api/borrowings/reject/${borrowing._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!res.ok) {
                        throw new Error(`Failed to reject borrowing: ${res.status}`);
                    }

                    const data = await res.json();
                    setBorrowing(data.borrowing);
                    
                    setPopup({
                        isOpen: true,
                        title: 'Thành công',
                        message: 'Đơn mượn đã được từ chối!',
                        type: 'success'
                    });
                } catch (error) {
                    console.error('Error rejecting borrowing:', error);
                    setPopup({
                        isOpen: true,
                        title: 'Lỗi',
                        message: 'Có lỗi xảy ra khi từ chối đơn mượn. Vui lòng thử lại.',
                        type: 'error'
                    });
                } finally {
                    setIsProcessing(false);
                }
            },
            confirmText: 'Từ chối',
            cancelText: 'Hủy'
        });
    };

    // Check if borrowing can be approved/rejected
    const canApproveReject = (status: string | undefined) => {
        if (!status) return false;
        return status === 'pending' || status === 'cancel-pending' || status === 'return-pending';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <Link href="/admin/borrowings" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại danh sách mượn thiết bị
                    </Link>
                </div>

                {/* Auth Loading State */}
                {authLoading && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
                    </div>
                )}

                {/* Not Logged In State */}
                {!authLoading && !user && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <span className="text-6xl">🔒</span>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa đăng nhập</h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            Vui lòng đăng nhập để truy cập trang quản lý.
                        </p>
                    </div>
                )}

                {/* Data Loading State */}
                {!authLoading && user && loading && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải thông tin đơn mượn...</p>
                    </div>
                )}

                {/* Error State */}
                {!authLoading && user && error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
                {!authLoading && user && !loading && !error && !borrowing && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <span className="text-6xl">📦</span>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy đơn mượn</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Đơn mượn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/admin/borrowings"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Về danh sách mượn thiết bị
                            </Link>
                        </div>
                    </div>
                )}

                {/* Borrowing Detail */}
                {!authLoading && user && !loading && !error && borrowing && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn mượn thiết bị</h1>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Mã đơn mượn: {borrowing._id}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(borrowing.status)}`}>
                                        {getStatusText(borrowing.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - User Information */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin người mượn</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-20">Tên:</span>
                                                <span className="text-sm text-gray-900">{borrowing.user.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-20">Email:</span>
                                                <span className="text-sm text-gray-900">{borrowing.user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin thiết bị</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-20">Tên:</span>
                                                <span className="text-sm text-gray-900">{borrowing.device.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-20">Loại:</span>
                                                <span className="text-sm text-gray-900">{borrowing.device.type}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-20">Trạng thái:</span>
                                                <span className={`text-sm font-medium ${getStatusColor(borrowing.device.status)}`}>
                                                    {borrowing.device.status === 'borrowed' ? 'Đã mượn' : borrowing.device.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Borrowing Information */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin mượn</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-24">Mã đơn:</span>
                                                <span className="text-sm font-mono text-gray-900">{borrowing._id}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-24">Ngày mượn:</span>
                                                <span className="text-sm text-gray-900">
                                                    {new Date(borrowing.borrowDate).toLocaleDateString('vi-VN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-24">Trạng thái:</span>
                                                <span className={`text-sm font-medium ${getStatusColor(borrowing.status)}`}>
                                                    {getStatusText(borrowing.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái</h3>
                                        <div className="space-y-3">
                                            {/* Status Display */}
                                            <div className="w-full px-4 py-3 text-center rounded-lg border-2 border-gray-200 bg-gray-50">
                                                <div className="flex items-center justify-center mb-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(borrowing.status)}`}>
                                                        {getStatusText(borrowing.status)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {borrowing.status === 'pending' && 'Đang chờ duyệt mượn thiết bị'}
                                                    {borrowing.status === 'cancel-pending' && 'Đang chờ duyệt hủy mượn'}
                                                    {borrowing.status === 'return-pending' && 'Đang chờ duyệt trả thiết bị'}
                                                    {borrowing.status === 'accept' && 'Đơn mượn đã được chấp nhận'}
                                                    {borrowing.status === 'reject' && 'Đơn mượn đã bị từ chối'}
                                                    {borrowing.status === 'cancel' && 'Đơn mượn đã được hủy'}
                                                    {borrowing.status === 'return' && 'Thiết bị đã được trả'}
                                                    {borrowing.status === 'borrowed' && 'Thiết bị đang được mượn'}
                                                </p>
                                            </div>

                                            {/* Action buttons - only show if can approve/reject */}
                                            {canApproveReject(borrowing.status) && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={handleAcceptBorrowing}
                                                        disabled={isProcessing}
                                                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                                Đang xử lý...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Duyệt đơn mượn
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={handleRejectBorrowing}
                                                        disabled={isProcessing}
                                                        className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                                Đang xử lý...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Từ chối đơn mượn
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Navigation buttons */}
                                            <div className="pt-3 border-t border-gray-200 space-y-3">
                                                <Link
                                                    href="/admin/borrowings"
                                                    className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    Quay lại danh sách
                                                </Link>
                                                <Link
                                                    href={`/devices/${borrowing.device._id}`}
                                                    className="w-full px-4 py-2 text-center text-sm font-medium text-indigo-700 bg-indigo-100 border border-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors"
                                                >
                                                    Xem thiết bị
                                                </Link>
                                            </div>
                                        </div>
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
                showActions={popup.showActions}
                onConfirm={popup.onConfirm}
                confirmText={popup.confirmText}
                cancelText={popup.cancelText}
            />
        </div>
    );
}
