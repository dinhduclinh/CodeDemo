import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type Borrowing = {
    _id: string;
    device: {
        _id: string;
        name: string;
        type: string;
        status: string;
        location?: string;
    };
    user: {
        _id: string;
        name: string;
        email: string;
    };
    borrowDate: string;
    status: string;
};

export default function BorrowingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBorrowings = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Check if user is logged in
                if (!user || !user.id) {
                    setBorrowings([]);
                    setLoading(false);
                    return;
                }
                
                const res = await fetch(`http://localhost:9999/api/borrowings/user/${user.id}`);
                
                // Handle different response statuses
                if (res.status === 404) {
                    // User not found or no borrowings - treat as empty list
                    setBorrowings([]);
                    setError(null);
                } else if (res.status === 400) {
                    // Invalid user ID format
                    setBorrowings([]);
                    setError('User ID không hợp lệ');
                } else if (!res.ok) {
                    // Other server errors - treat as empty list with warning
                    console.warn(`Server error ${res.status}, treating as no borrowings`);
                    setBorrowings([]);
                    setError(null);
                } else {
                    // Success response
                    const data = await res.json();
                    console.log('Borrowings API Response:', data);
                    
                    // Handle different possible response structures
                    let list: Borrowing[] = [];
                    if (data && data.borrowings && Array.isArray(data.borrowings)) {
                        list = data.borrowings;
                    } else if (data && Array.isArray(data)) {
                        list = data;
                    } else if (data && data.code === 200 && data.borrowings) {
                        list = data.borrowings;
                    } else {
                        console.warn('Unexpected response format:', data);
                        list = [];
                    }
                    
                    setBorrowings(list);
                    setError(null);
                }
            } catch (err: unknown) {
                // Network errors or other issues - treat as no borrowings
                console.warn('Error fetching borrowings, treating as no borrowings:', err);
                setBorrowings([]);
                setError(null);
            } finally {
                setLoading(false);
            }
        };
        
        // Only fetch if auth is loaded and user is logged in
        if (!authLoading) {
            fetchBorrowings();
        }
    }, [user, authLoading]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Danh sách mượn thiết bị
                                </h1>
                                {user && (
                                    <p className="mt-2 text-gray-600 flex items-center">
                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                        Xin chào, <span className="font-semibold text-indigo-600 ml-1">{user.name}</span>!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
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
                        <p className="mt-6 text-lg font-medium text-gray-700">Đang kiểm tra đăng nhập...</p>
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
                            Vui lòng đăng nhập để xem danh sách mượn thiết bị của bạn.
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
                        <p className="mt-6 text-lg font-medium text-gray-700">Đang tải danh sách mượn thiết bị...</p>
                        <p className="mt-2 text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                )}

                {/* Error State - Only show for specific errors */}
                {error && error !== 'User ID không hợp lệ' && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-8 shadow-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-yellow-800">
                                    Thông báo
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Borrowings List */}
                {!authLoading && user && !loading && (
                    <div className="space-y-8">
                        {/* Stats Header */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Danh sách mượn thiết bị
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        Tất cả thiết bị đã mượn của bạn
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-indigo-600">{borrowings.length}</div>
                                        <div className="text-sm text-gray-500">Tổng số</div>
                                    </div>
                                    <div className="w-px h-12 bg-gray-200"></div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600">
                                            {borrowings.filter(b => b.status === 'accept' || b.status === 'accepted').length}
                                        </div>
                                        <div className="text-sm text-gray-500">Đã duyệt</div>
                                    </div>
                                    <div className="w-px h-12 bg-gray-200"></div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-yellow-600">
                                            {borrowings.filter(b => b.status === 'pending').length}
                                        </div>
                                        <div className="text-sm text-gray-500">Chờ duyệt</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {borrowings.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa mượn thiết bị</h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-8">
                                    Bạn chưa mượn thiết bị nào. Hãy khám phá các thiết bị có sẵn!
                                </p>
                                <Link
                                    href="/devices"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Khám phá thiết bị
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {borrowings.map((b) => (
                                    <div key={b._id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                        {/* Card Header */}
                                        <div className="relative p-6 pb-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Borrowing</span>
                                                </div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    b.status === 'borrowed' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : b.status === 'accept' || b.status === 'accepted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : b.status === 'reject' || b.status === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : b.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : b.status === 'cancel-pending'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : b.status === 'cancel'
                                                        ? 'bg-red-100 text-red-800'
                                                        : b.status === 'return-pending'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : b.status === 'return'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {b.status === 'borrowed' ? 'Đã mượn' :
                                                     b.status === 'accept' || b.status === 'accepted' ? 'Chấp nhận' :
                                                     b.status === 'reject' || b.status === 'rejected' ? 'Từ chối' :
                                                     b.status === 'pending' ? 'Chờ duyệt' :
                                                     b.status === 'cancel-pending' ? 'Chờ hủy' :
                                                     b.status === 'cancel' ? 'Đã hủy' :
                                                     b.status === 'return-pending' ? 'Chờ trả' :
                                                     b.status === 'return' ? 'Đã trả' : b.status}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {b.device.name}
                                            </h3>
                                            
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                {b.device.type}
                                            </div>
                                        </div>
                                        
                                        {/* Card Body */}
                                        <div className="px-6 pb-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-500">Mã mượn</span>
                                                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{b._id.slice(-8)}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-500">Người mượn</span>
                                                    <span className="text-sm text-gray-900">{b.user.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-2">
                                                    <span className="text-sm font-medium text-gray-500">Ngày mượn</span>
                                                    <span className="text-sm text-gray-900">{new Date(b.borrowDate).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Card Footer */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                            <div className="flex space-x-3">
                                                <Link 
                                                    href={`/borrowings/${b._id}`} 
                                                    className="flex-1 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-colors text-center"
                                                >
                                                    Xem chi tiết
                                                </Link>
                                                <Link 
                                                    href={`/devices/${b.device._id}`} 
                                                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors text-center"
                                                >
                                                    Xem thiết bị
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}