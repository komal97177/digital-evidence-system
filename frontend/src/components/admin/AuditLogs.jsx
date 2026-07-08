// Location: /frontend/src/components/admin/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    Download, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    Activity,
    User,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        action: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        failure: 0,
        uniqueUsers: 0
    });

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filters, pagination.page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                action: filters.action || undefined,
                status: filters.status || undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined
            };
            const response = await api.get('/admin/audit-logs', { params });
            setLogs(response.data.logs);
            setPagination(prev => ({
                ...prev,
                total: response.data.total
            }));
        } catch (error) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/audit-logs/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const exportLogs = async (format = 'csv') => {
        try {
            const response = await api.get('/admin/audit-logs/export', {
                params: { ...filters, format },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export started');
        } catch (error) {
            toast.error('Failed to export logs');
        }
    };

    const getActionBadge = (action) => {
        const colors = {
            login: 'bg-green-100 text-green-800',
            logout: 'bg-gray-100 text-gray-800',
            create: 'bg-blue-100 text-blue-800',
            update: 'bg-yellow-100 text-yellow-800',
            delete: 'bg-red-100 text-red-800',
            upload: 'bg-purple-100 text-purple-800',
            download: 'bg-indigo-100 text-indigo-800',
            register: 'bg-blue-100 text-blue-800',
            transfer: 'bg-orange-100 text-orange-800',
            verify: 'bg-teal-100 text-teal-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failure':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            default:
                return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            success: 'bg-green-100 text-green-800 border-green-200',
            failure: 'bg-red-100 text-red-800 border-red-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-blue-600" />
                        Audit Logs
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        System activity and security audit trail
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => exportLogs('csv')}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                    </button>
                    <button
                        onClick={() => exportLogs('pdf')}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="govt-card p-4">
                    <p className="text-sm text-gray-500">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="govt-card p-4 border-green-200">
                    <p className="text-sm text-gray-500">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                </div>
                <div className="govt-card p-4 border-red-200">
                    <p className="text-sm text-gray-500">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failure}</p>
                </div>
                <div className="govt-card p-4">
                    <p className="text-sm text-gray-500">Unique Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filters.action}
                    onChange={(e) => setFilters({...filters, action: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="upload">Upload</option>
                    <option value="download">Download</option>
                    <option value="register">Register</option>
                    <option value="transfer">Transfer</option>
                    <option value="verify">Verify</option>
                </select>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                    <option value="warning">Warning</option>
                </select>
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="End Date"
                />
            </div>

            {/* Logs Table */}
            <div className="govt-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resource
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IP Address
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <div className="govt-loader"></div>
                                            <p className="mt-4 text-gray-500">Loading logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <Activity className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500">No audit logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-3 h-3 text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    {log.username || 'System'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-gray-600">{log.resource_type || '-'}</p>
                                                {log.resource_id && (
                                                    <p className="text-xs text-gray-400">ID: {log.resource_id}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                                {getStatusIcon(log.status)}
                                                <span>{log.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {log.ip_address || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                    <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} entries
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
                            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;