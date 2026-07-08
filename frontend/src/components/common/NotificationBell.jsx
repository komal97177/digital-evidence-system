// frontend/src/components/common/NotificationBell.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);

    const getIcon = (type) => {
        switch(type) {
            case 'success': return <Check className="w-4 h-4 text-green-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch(type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`
                                            p-4 cursor-pointer hover:bg-gray-50 transition-colors
                                            ${notification.read ? 'opacity-75' : 'bg-blue-50/30'}
                                        `}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 text-center">
                        <button
                            onClick={() => {
                                navigate('/notifications');
                                setIsOpen(false);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;