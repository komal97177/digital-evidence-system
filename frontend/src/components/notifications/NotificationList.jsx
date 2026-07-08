// Location: /frontend/src/components/notifications/NotificationList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, 
    Check, 
    X, 
    AlertCircle, 
    Info, 
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Trash2,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    Settings,
    RefreshCw,
    BellOff,
    BellRing,
    Mail,
    Shield,
    User,
    FileText,
    FolderCase,
    Activity,
    Calendar,
    MoreVertical,
    Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

const NotificationList = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        removeNotification,
        clearAllNotifications
    } = useContext(NotificationContext);
    
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        read: 0,
        byType: {}
    });

    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [filter, pagination.page]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications', {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    filter: filter !== 'all' ? filter : undefined,
                    search: searchTerm || undefined
                }
            });
            // Update context with fetched notifications
            // This would integrate with your context
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/notifications/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({...prev, page: 1}));
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPagination(prev => ({...prev, page: 1}));
    };

    const toggleSelection = (id) => {
        setSelectedNotifications(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedNotifications.length === notifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(notifications.map(n => n.id));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedNotifications.length === 0) {
            toast.warning('Please select at least one notification');
            return;
        }

        try {
            await api.post('/notifications/bulk', {
                action,
                ids: selectedNotifications
            });
            
            if (action === 'mark_read') {
                selectedNotifications.forEach(id => markAsRead(id));
                toast.success('Marked as read');
            } else if (action === 'delete') {
                selectedNotifications.forEach(id => removeNotification(id));
                toast.success('Deleted successfully');
            }
            
            setSelectedNotifications([]);
            setShowBulkActions(false);
            fetchStats();
        } catch (error) {
            toast.error('Bulk action failed');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            markAllAsRead();
            toast.success('All notifications marked as read');
            fetchStats();
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear all notifications?')) return;
        
        try {
            await api.delete('/notifications/clear-all');
            clearAllNotifications();
            toast.success('All notifications cleared');
            fetchStats();
        } catch (error) {
            toast.error('Failed to clear notifications');
        }
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
            case 'evidence':
                return <FileText className="w-5 h-5 text-purple-500" />;
            case 'case':
                return <FolderCase className="w-5 h-5 text-blue-500" />;
            case 'custody':
                return <Shield className="w-5 h-5 text-indigo-500" />;
            case 'system':
                return <Activity className="w-5 h-5 text-gray-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            success: 'bg-green-50 border-green-200',
            error: 'bg-red-50 border-red-200',
            warning: 'bg-yellow-50 border-yellow-200',
            info: 'bg-blue-50 border-blue-200',
            evidence: 'bg-purple-50 border-purple-200',
            case: 'bg-blue-50 border-blue-200',
            custody: 'bg-indigo-50 border-indigo-200',
            system: 'bg-gray-50 border-gray-200'
        };
        return colors[type] || 'bg-gray-50 border-gray-200';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const getFilterOptions = () => {
        const options = [
            { value: 'all', label: 'All', count: stats.total },
            { value: 'unread', label: 'Unread', count: stats.unread },
            { value: 'read', label: 'Read', count: stats.read },
            { value: 'evidence', label: 'Evidence', count: stats.byType?.evidence || 0 },
            { value: 'case', label: 'Cases', count: stats.byType?.case || 0 },
            { value: 'custody', label: 'Custody', count: stats.byType?.custody || 0 },
            { value: 'system', label: 'System', count: stats.byType?.system || 0 }
        ];
        return options;
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        if (filter !== 'all' && filter !== 'unread' && filter !== 'read') {
            return n.type === filter;
        }
        return true;
    }).filter(n => 
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Bell className="w-6 h-6 mr-2 text-blue-600" />
                        Notifications
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage all your notifications and alerts
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/notifications/preferences')}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Preferences
                    </button>
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={unreadCount === 0}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="govt-card p-4">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="govt-card p-4 border-blue-200">
                    <p className="text-sm text-gray-500">Unread</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                </div>
                <div className="govt-card p-4 border-green-200">
                    <p className="text-sm text-gray-500">Read</p>
                    <p className="text-2xl font-bold text-green-600">{stats.read}</p>
                </div>
                <div className="govt-card p-4 border-purple-200">
                    <p className="text-sm text-gray-500">Today</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length}
                    </p>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-blue-700">
                        {selectedNotifications.length} notification(s) selected
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('mark_read')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                        >
                            Mark Read
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setSelectedNotifications([])}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {getFilterOptions().map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleFilterChange(option.value)}
                            className={`
                                px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${filter === option.value 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                            `}
                        >
                            {option.label}
                            {option.count > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                                    filter === option.value ? 'bg-white/20' : 'bg-gray-200'
                                }`}>
                                    {option.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="govt-loader mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </div>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                    <BellOff className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No notifications</p>
                    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`
                                border rounded-lg p-4 transition-all hover:shadow-md
                                ${notification.read ? 'bg-white' : 'bg-blue-50/30 border-blue-200'}
                                ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}
                            `}
                        >
                            <div className="flex items-start space-x-4">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedNotifications.includes(notification.id)}
                                    onChange={() => toggleSelection(notification.id)}
                                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                {/* Icon */}
                                <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            {notification.data && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                                                        {JSON.stringify(notification.data, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatDate(notification.timestamp)}
                                                </span>
                                                <span>•</span>
                                                <span className="capitalize">{notification.type}</span>
                                                {notification.sender && (
                                                    <>
                                                        <span>•</span>
                                                        <span>From: {notification.sender}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {notification.link && (
                                                <button
                                                    onClick={() => {
                                                        markAsRead(notification.id);
                                                        navigate(notification.link);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => removeNotification(notification.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {filteredNotifications.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                    <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, filteredNotifications.length)} of{' '}
                        {filteredNotifications.length} notifications
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPagination(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {pagination.page} of {Math.ceil(filteredNotifications.length / pagination.limit)}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                            disabled={pagination.page >= Math.ceil(filteredNotifications.length / pagination.limit)}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Export & Clear */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            // Export logic
                            toast.info('Exporting notifications...');
                        }}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={fetchNotifications}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
                <button
                    onClick={handleClearAll}
                    className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                </button>
            </div>
        </div>
    );
};

export default NotificationList;