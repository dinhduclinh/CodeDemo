import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Popup from '../../components/Popup';

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
                    // Bỏ kiểm tra quyền truy cập - tất cả role đều có thể xem
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
    }, [id, user]);

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

    const handleCancelBorrowing = async () => {
        if (!borrowing || !user) return;

        try {
            setIsProcessing(true);
            
            const response = await fetch(`http://localhost:9999/api/borrowings/cancel/${borrowing._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                setPopup({
                    isOpen: true,
                    title: 'Hủy mượn thành công',
                    message: 'Bạn đã hủy đơn mượn thiết bị thành công.',
                    type: 'success'
                });
                // Refresh data
                window.location.reload();
            } else {
                setPopup({
                    isOpen: true,
                    title: 'Lỗi hủy mượn',
                    message: data.message || 'Có lỗi xảy ra khi hủy mượn thiết bị.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error canceling borrowing:', error);
            setPopup({
                isOpen: true,
                title: 'Lỗi hủy mượn',
                message: 'Có lỗi xảy ra khi hủy mượn thiết bị. Vui lòng thử lại.',
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReturnBorrowing = async () => {
        if (!borrowing || !user) return;

        try {
            setIsProcessing(true);
            
            const response = await fetch(`http://localhost:9999/api/borrowings/return/${borrowing._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                setPopup({
                    isOpen: true,
                    title: 'Trả thiết bị thành công',
                    message: 'Bạn đã trả thiết bị thành công.',
                    type: 'success'
                });
                // Refresh data
                window.location.reload();
            } else {
                setPopup({
                    isOpen: true,
                    title: 'Lỗi trả thiết bị',
                    message: data.message || 'Có lỗi xảy ra khi trả thiết bị.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error returning borrowing:', error);
            setPopup({
                isOpen: true,
                title: 'Lỗi trả thiết bị',
                message: 'Có lỗi xảy ra khi trả thiết bị. Vui lòng thử lại.',
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <Link href="/borrowings" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-6 group">
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 mr-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        Quay lại danh sách mượn thiết bị
                    </Link>
                </div>

                {/* Auth Loading State */}
                {authLoading && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <p className="mt-6 text-lg font-medium text-gray-700">Đang kiểm tra quyền truy cập...</p>
                        <p className="mt-2 text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                )}

                {/* Not Logged In State */}
                {!authLoading && !user && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa đăng nhập</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                            Vui lòng đăng nhập để xem chi tiết đơn mượn thiết bị.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Đăng nhập ngay
                        </Link>
                    </div>
                )}

                {/* Data Loading State */}
                {!authLoading && user && loading && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <p className="mt-6 text-lg font-medium text-gray-700">Đang tải thông tin đơn mượn...</p>
                        <p className="mt-2 text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                )}

                {/* Error State */}
                {!authLoading && user && error && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-red-800">
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
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy đơn mượn</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                            Đơn mượn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                        </p>
                        <Link
                            href="/borrowings"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Về danh sách mượn thiết bị
                        </Link>
                    </div>
                )}

                {/* Borrowing Detail */}
                {!authLoading && user && !loading && !error && borrowing && (
                    <div className="space-y-8">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            Chi tiết đơn mượn thiết bị
                                        </h1>
                                        <p className="mt-2 text-gray-600">
                                            Mã đơn mượn: <span className="font-mono text-indigo-600">{borrowing._id}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(borrowing.status)}`}>
                                        {getStatusText(borrowing.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Information Table - 3 columns */}
                            <div className="lg:col-span-3">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-3">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            Thông tin chi tiết
                                        </h3>
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {/* User Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900">Người mượn</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm font-medium text-gray-500">Tên</span>
                                                        <span className="text-sm font-semibold text-gray-900">{borrowing.user.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm font-medium text-gray-500">Email</span>
                                                        <span className="text-sm font-semibold text-gray-900">{borrowing.user.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Device Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900">Thiết bị</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm font-medium text-gray-500">Tên thiết bị</span>
                                                        <span className="text-sm font-semibold text-gray-900">{borrowing.device.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm font-medium text-gray-500">Loại</span>
                                                        <span className="text-sm font-semibold text-gray-900">{borrowing.device.type}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(borrowing.device.status)}`}>
                                                            {borrowing.device.status === 'borrowed' ? 'Đã mượn' : borrowing.device.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Borrowing Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900">Mượn</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm font-medium text-gray-500">Mã đơn</span>
                                                        <span className="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{borrowing._id.slice(-8)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm font-medium text-gray-500">Ngày mượn</span>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {new Date(borrowing.borrowDate).toLocaleDateString('vi-VN', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(borrowing.status)}`}>
                                                            {getStatusText(borrowing.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Column - 1 column */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-full">
                                    <div className="flex items-center mb-6">
                                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Hành động</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Cancel Button - Show for pending/accept/accepted status */}
                                        {(borrowing.status === 'pending' || borrowing.status === 'accept' || borrowing.status === 'accepted') && (
                                            <button
                                                onClick={handleCancelBorrowing}
                                                disabled={isProcessing}
                                                className="w-full px-4 py-3 text-sm font-semibold text-red-700 bg-red-100 border border-red-300 rounded-xl hover:bg-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-600 mr-2"></div>
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Hủy mượn
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Return Button - Show for accepted status only */}
                                        {(borrowing.status === 'accept' || borrowing.status === 'accepted') && (
                                            <button
                                                onClick={handleReturnBorrowing}
                                                disabled={isProcessing}
                                                className="w-full px-4 py-3 text-sm font-semibold text-green-700 bg-green-100 border border-green-300 rounded-xl hover:bg-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-300 border-t-green-600 mr-2"></div>
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Trả thiết bị
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Status Info - Show for pending states */}
                                        {(borrowing.status === 'cancel-pending' || borrowing.status === 'return-pending') && (
                                            <div className="w-full px-4 py-3 text-sm font-semibold text-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600">
                                                {borrowing.status === 'cancel-pending' ? 'Đang chờ hủy mượn' : 'Đang chờ trả thiết bị'}
                                            </div>
                                        )}

                                        {/* Navigation Buttons */}
                                        <div className="pt-4 border-t border-gray-200 space-y-3">
                                            <Link
                                                href="/borrowings"
                                                className="w-full px-4 py-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Quay lại danh sách
                                            </Link>
                                            <Link
                                                href={`/devices/${borrowing.device._id}`}
                                                className="w-full px-4 py-3 text-center text-sm font-semibold text-indigo-700 bg-indigo-100 border border-indigo-300 rounded-xl hover:bg-indigo-200 transition-all duration-200 flex items-center justify-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Xem thiết bị
                                            </Link>
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
            />
        </div>
    );
}
