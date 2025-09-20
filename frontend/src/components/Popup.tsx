import { useEffect } from 'react';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    showActions?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function Popup({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'info', 
    showActions = false, 
    onConfirm, 
    confirmText = 'Xác nhận', 
    cancelText = 'Hủy' 
}: PopupProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getIconAndColors = () => {
        switch (type) {
            case 'success':
                return {
                    icon: '✅',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    iconColor: 'text-green-400',
                    titleColor: 'text-green-800',
                    messageColor: 'text-green-700'
                };
            case 'error':
                return {
                    icon: '❌',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-400',
                    titleColor: 'text-red-800',
                    messageColor: 'text-red-700'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    iconColor: 'text-yellow-400',
                    titleColor: 'text-yellow-800',
                    messageColor: 'text-yellow-700'
                };
            default:
                return {
                    icon: 'ℹ️',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    iconColor: 'text-blue-400',
                    titleColor: 'text-blue-800',
                    messageColor: 'text-blue-700'
                };
        }
    };

    const colors = getIconAndColors();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />
                
                {/* Modal */}
                <div className={`relative w-full max-w-md transform overflow-hidden rounded-lg ${colors.bgColor} ${colors.borderColor} border shadow-xl transition-all`}>
                    <div className="p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <span className={`text-2xl ${colors.iconColor}`}>
                                    {colors.icon}
                                </span>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <h3 className={`text-lg font-medium ${colors.titleColor}`}>
                                    {title}
                                </h3>
                                <div className={`mt-2 text-sm ${colors.messageColor}`}>
                                    {message}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                        {showActions ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                        type === 'warning' 
                                            ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                                            : type === 'error'
                                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                            : type === 'success'
                                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                    }`}
                                >
                                    {confirmText}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                                Đóng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
