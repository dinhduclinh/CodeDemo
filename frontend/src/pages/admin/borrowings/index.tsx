import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Popup from '../../../components/Popup';

type Borrowing = {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    device: {
        name: string;
        type: string;
        status: string;
    };
    borrowDate: string;
    status?: string;
    __v: number;
};

export default function AdminBorrowingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [filteredBorrowings, setFilteredBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
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
    const [confirmPopup, setConfirmPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: 'accept' | 'reject' | null;
        borrowingId: string | null;
        borrowingInfo: {
            userName: string;
            deviceName: string;
        } | null;
    }>({
        isOpen: false,
        title: '',
        message: '',
        action: null,
        borrowingId: null,
        borrowingInfo: null
    });
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        const fetchBorrowings = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const res = await fetch('http://localhost:9999/api/borrowings');
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch borrowings: ${res.status}`);
                }
                
                const data = await res.json();
                console.log('Borrowings API Response:', data);
                
                // Handle different possible response structures
                let list: Borrowing[] = [];
                if (data && data.borrowings && Array.isArray(data.borrowings)) {
                    list = data.borrowings;
                } else if (data && Array.isArray(data)) {
                    list = data;
                } else {
                    console.warn('Unexpected response format:', data);
                    list = [];
                }
                
                setBorrowings(list);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
                console.error('Error fetching borrowings:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBorrowings();
    }, []);

    // Filter borrowings based on search and filters
    useEffect(() => {
        let filtered = [...borrowings];

        // Search by user name
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(borrowing => 
                borrowing.user.name.toLowerCase().includes(query) ||
                borrowing.user.email.toLowerCase().includes(query)
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(borrowing => {
                if (!borrowing.status) return statusFilter === 'undefined';
                
                // Group pending states together
                if (statusFilter === 'pending') {
                    return borrowing.status.toLowerCase() === 'pending' || 
                           borrowing.status.toLowerCase() === 'cancel-pending' || 
                           borrowing.status.toLowerCase() === 'return-pending';
                }
                
                return borrowing.status.toLowerCase() === statusFilter.toLowerCase();
            });
        }

        // Filter by date
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(borrowing => {
                const borrowDate = new Date(borrowing.borrowDate);
                const borrowDateOnly = new Date(borrowDate.getFullYear(), borrowDate.getMonth(), borrowDate.getDate());
                
                switch (dateFilter) {
                    case 'today':
                        return borrowDateOnly.getTime() === today.getTime();
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return borrowDateOnly >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return borrowDateOnly >= monthAgo;
                    case 'year':
                        const yearAgo = new Date(today);
                        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                        return borrowDateOnly >= yearAgo;
                    default:
                        return true;
                }
            });
        }

        setFilteredBorrowings(filtered);
    }, [borrowings, searchQuery, statusFilter, dateFilter]);

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

    const showConfirmPopup = (action: 'accept' | 'reject', borrowingId: string, borrowingInfo: { userName: string; deviceName: string }) => {
        setConfirmPopup({
            isOpen: true,
            title: action === 'accept' ? 'Xác nhận duyệt đơn mượn' : 'Xác nhận từ chối đơn mượn',
            message: action === 'accept' 
                ? `Bạn có chắc chắn muốn duyệt đơn mượn thiết bị "${borrowingInfo.deviceName}" của ${borrowingInfo.userName}?`
                : `Bạn có chắc chắn muốn từ chối đơn mượn thiết bị "${borrowingInfo.deviceName}" của ${borrowingInfo.userName}?`,
            action,
            borrowingId,
            borrowingInfo
        });
    };

    const closeConfirmPopup = () => {
        setConfirmPopup({
            isOpen: false,
            title: '',
            message: '',
            action: null,
            borrowingId: null,
            borrowingInfo: null
        });
    };

    const handleConfirmAction = () => {
        if (confirmPopup.action === 'accept' && confirmPopup.borrowingId) {
            handleAcceptBorrowing(confirmPopup.borrowingId);
        } else if (confirmPopup.action === 'reject' && confirmPopup.borrowingId) {
            handleRejectBorrowing(confirmPopup.borrowingId);
        }
    };

    const handleAcceptBorrowing = async (borrowingId: string) => {
        try {
            setIsProcessing(true);
            const response = await fetch(`http://localhost:9999/api/borrowings/accept/${borrowingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Cập nhật trạng thái trong danh sách
                setBorrowings(prevBorrowings => 
                    prevBorrowings.map(borrowing => 
                        borrowing._id === borrowingId 
                            ? { ...borrowing, status: 'accept' }
                            : borrowing
                    )
                );

                // Đóng popup xác nhận
                closeConfirmPopup();

                setPopup({
                    isOpen: true,
                    title: '✅ Duyệt thành công',
                    message: `Đơn mượn thiết bị "${confirmPopup.borrowingInfo?.deviceName}" của ${confirmPopup.borrowingInfo?.userName} đã được duyệt thành công.`,
                    type: 'success'
                });
            } else {
                closeConfirmPopup();
                setPopup({
                    isOpen: true,
                    title: '❌ Lỗi duyệt đơn mượn',
                    message: data.message || 'Có lỗi xảy ra khi duyệt đơn mượn.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error accepting borrowing:', error);
            closeConfirmPopup();
            setPopup({
                isOpen: true,
                title: '❌ Lỗi duyệt đơn mượn',
                message: 'Có lỗi xảy ra khi duyệt đơn mượn. Vui lòng thử lại.',
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectBorrowing = async (borrowingId: string) => {
        try {
            setIsProcessing(true);
            const response = await fetch(`http://localhost:9999/api/borrowings/reject/${borrowingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Cập nhật trạng thái trong danh sách
                setBorrowings(prevBorrowings => 
                    prevBorrowings.map(borrowing => 
                        borrowing._id === borrowingId 
                            ? { ...borrowing, status: 'reject' }
                            : borrowing
                    )
                );

                // Đóng popup xác nhận
                closeConfirmPopup();

                setPopup({
                    isOpen: true,
                    title: '✅ Từ chối thành công',
                    message: `Đơn mượn thiết bị "${confirmPopup.borrowingInfo?.deviceName}" của ${confirmPopup.borrowingInfo?.userName} đã được từ chối.`,
                    type: 'success'
                });
            } else {
                closeConfirmPopup();
                setPopup({
                    isOpen: true,
                    title: '❌ Lỗi từ chối đơn mượn',
                    message: data.message || 'Có lỗi xảy ra khi từ chối đơn mượn.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error rejecting borrowing:', error);
            closeConfirmPopup();
            setPopup({
                isOpen: true,
                title: '❌ Lỗi từ chối đơn mượn',
                message: 'Có lỗi xảy ra khi từ chối đơn mượn. Vui lòng thử lại.',
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý mượn thiết bị</h1>
                            <p className="mt-2 text-gray-600">
                                Danh sách tất cả các đơn mượn thiết bị trong hệ thống
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Tổng số đơn mượn</p>
                            <p className="text-2xl font-bold text-indigo-600">{filteredBorrowings.length}</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search by User Name */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Tìm kiếm theo tên người dùng
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Nhập tên hoặc email..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Lọc theo trạng thái
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="borrowed">Đã mượn</option>
                                <option value="accept">Chấp nhận</option>
                                <option value="reject">Từ chối</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="cancel">Đã hủy</option>
                                <option value="return">Đã trả</option>
                                <option value="undefined">Không xác định</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Lọc theo thời gian
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="all">Tất cả thời gian</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="year">1 năm qua</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
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
                        <p className="mt-4 text-gray-600">Đang tải danh sách mượn thiết bị...</p>
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

                {/* Borrowings List */}
                {!authLoading && user && !loading && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Danh sách đơn mượn thiết bị ({filteredBorrowings.length})
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                                    ? 'Kết quả tìm kiếm và lọc' 
                                    : 'Tất cả các đơn mượn thiết bị trong hệ thống'
                                }
                            </p>
                        </div>
                        
                        {filteredBorrowings.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl">📦</span>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">
                                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                                        ? 'Không tìm thấy kết quả' 
                                        : 'Chưa có đơn mượn nào'
                                    }
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                                        ? 'Không có đơn mượn nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi điều kiện tìm kiếm.'
                                        : 'Hiện tại chưa có đơn mượn thiết bị nào trong hệ thống.'
                                    }
                                </p>
                                {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                            setDateFilter('all');
                                        }}
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mã đơn mượn
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Người mượn
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thiết bị
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày mượn
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBorrowings.map((borrowing) => (
                                            <tr key={borrowing._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                    {borrowing._id.slice(-8)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {borrowing.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {borrowing.user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {borrowing.device.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {borrowing.device.type}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(borrowing.borrowDate).toLocaleDateString('vi-VN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(borrowing.status)}`}>
                                                        {getStatusText(borrowing.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-6">
                                                        <Link 
                                                            href={`/admin/borrowings/${borrowing._id}`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Xem chi tiết
                                                        </Link>
                                                        {/* Only show action buttons for pending states */}
                                                        {(borrowing.status === 'pending' || borrowing.status === 'cancel-pending' || borrowing.status === 'return-pending') && (
                                                            <>
                                                                <button 
                                                                    onClick={() => showConfirmPopup('accept', borrowing._id, {
                                                                        userName: borrowing.user.name,
                                                                        deviceName: borrowing.device.name
                                                                    })}
                                                                    disabled={isProcessing}
                                                                    className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-900 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Duyệt
                                                                </button>
                                                                <button 
                                                                    onClick={() => showConfirmPopup('reject', borrowing._id, {
                                                                        userName: borrowing.user.name,
                                                                        deviceName: borrowing.device.name
                                                                    })}
                                                                    disabled={isProcessing}
                                                                    className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-900 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Từ chối
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        {/* Show status info for completed states */}
                                                        {(borrowing.status === 'cancel' || borrowing.status === 'return') && (
                                                            <span className="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-md">
                                                                {borrowing.status === 'cancel' ? 'Đã hủy' : 'Đã trả'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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

            {/* Confirm Popup */}
            <Popup
                isOpen={confirmPopup.isOpen}
                onClose={closeConfirmPopup}
                title={confirmPopup.title}
                message={confirmPopup.message}
                type="warning"
                showActions={true}
                onConfirm={handleConfirmAction}
                confirmText={confirmPopup.action === 'accept' ? 'Duyệt' : 'Từ chối'}
                cancelText="Hủy"
            />
        </div>
    );
}
