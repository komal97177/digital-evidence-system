// Location: /frontend/src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    FolderCase, 
    FileText, 
    Activity,
    Shield,
    AlertTriangle,
    TrendingUp,
    Clock,
    Plus,
    Search,
    BarChart,
    Database,
    Server,
    CheckCircle,
    XCircle,
    RefreshCw,
    Calendar,
    UserCheck,
    FileArchive,
    Download,
    Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: { total: 0, active: 0, inactive: 0 },
        cases: { total: 0, open: 0, closed: 0 },
        evidence: { total: 0, stored: 0, transferred: 0, archived: 0 },
        custody: { total: 0, today: 0 }
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        status: 'healthy',
        uptime: 0,
        cpu: 0,
        memory: 0,
        disk: 0
    });
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('7d');

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [timeframe]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activityRes, healthRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/audit-logs', { params: { limit: 10 } }),
                api.get('/admin/health')
            ]);
            
            setStats(statsRes.data);
            setRecentActivity(activityRes.data.logs || []);
            setSystemHealth(healthRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { 
            title: 'Total Users', 
            value: stats.users.total, 
            icon: Users, 
            color: 'blue',
            subtext: `${stats.users.active} active`,
            link: '/admin/users'
        },
        { 
            title: 'Active Cases', 
            value: stats.cases.open, 
            icon: FolderCase, 
            color: 'green',
            subtext: `${stats.cases.total} total`,
            link: '/cases'
        },
        { 
            title: 'Evidence Items', 
            value: stats.evidence.total, 
            icon: FileText, 
            color: 'purple',
            subtext: `${stats.evidence.stored} stored`,
            link: '/evidence'
        },
        { 
            title: 'Custody Events', 
            value: stats.custody.total, 
            icon: Activity, 
            color: 'orange',
            subtext: `${stats.custody.today} today`,
            link: '/custody'
        }
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'healthy': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'error': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getActivityIcon = (action) => {
        switch(action) {
            case 'login': return <UserCheck className="w-4 h-4 text-green-500" />;
            case 'logout': return <LogOut className="w-4 h-4 text-gray-500" />;
            case 'upload': return <Upload className="w-4 h-4 text-blue-500" />;
            case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
            case 'update': return <Edit className="w-4 h-4 text-yellow-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="govt-loader mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="govt-card p-6 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-blue-100 mt-1">
                            Welcome back! System is running smoothly.
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-blue-200">
                            <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Last updated: {new Date().toLocaleString()}
                            </span>
                            <span className="flex items-center">
                                <Server className="w-4 h-4 mr-1" />
                                Uptime: {Math.floor(systemHealth.uptime / 3600)}h
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <div className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                    systemHealth.status === 'healthy' ? 'bg-green-400' :
                                    systemHealth.status === 'warning' ? 'bg-yellow-400' :
                                    'bg-red-400'
                                }`}></span>
                                <span className="font-semibold capitalize">{systemHealth.status}</span>
                            </div>
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div 
                        key={index} 
                        className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => navigate(stat.link)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {stat.value.toLocaleString()}
                                </p>
                                <span className="text-xs text-gray-500">{stat.subtext}</span>
                            </div>
                            <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-700">Manage Users</span>
                </button>
                <button
                    onClick={() => navigate('/evidence/upload')}
                    className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                    <Plus className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-700">Upload Evidence</span>
                </button>
                <button
                    onClick={() => navigate('/admin/audit-logs')}
                    className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                    <Activity className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-700">View Audit Logs</span>
                </button>
                <button
                    onClick={() => navigate('/admin/backup')}
                    className="flex items-center justify-center px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                >
                    <Database className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-700">Backup System</span>
                </button>
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Health */}
                <div className="govt-card p-6 lg:col-span-1">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Server className="w-5 h-5 mr-2 text-blue-600" />
                        System Health
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">CPU Usage</span>
                                <span className="font-medium">{systemHealth.cpu}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                    className={`h-2 rounded-full ${
                                        systemHealth.cpu < 60 ? 'bg-green-500' :
                                        systemHealth.cpu < 80 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(systemHealth.cpu, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Memory Usage</span>
                                <span className="font-medium">{systemHealth.memory}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                    className={`h-2 rounded-full ${
                                        systemHealth.memory < 70 ? 'bg-green-500' :
                                        systemHealth.memory < 85 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(systemHealth.memory, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Disk Usage</span>
                                <span className="font-medium">{systemHealth.disk}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                    className={`h-2 rounded-full ${
                                        systemHealth.disk < 75 ? 'bg-green-500' :
                                        systemHealth.disk < 90 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(systemHealth.disk, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="govt-card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-600" />
                            Recent Activity
                        </h3>
                        <button
                            onClick={() => navigate('/admin/audit-logs')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent activity</p>
                        ) : (
                            recentActivity.map((log, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        {getActivityIcon(log.action)}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {log.action}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {log.username || 'System'} · {log.resource_type || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            log.status === 'success' ? 'bg-green-100 text-green-800' :
                                            log.status === 'failure' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {log.status}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Evidence Status */}
            <div className="govt-card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileArchive className="w-5 h-5 mr-2 text-blue-600" />
                    Evidence Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Registered</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {stats.evidence.total - stats.evidence.stored - stats.evidence.transferred - stats.evidence.archived}
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Stored</p>
                        <p className="text-2xl font-bold text-green-700">{stats.evidence.stored}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Transferred</p>
                        <p className="text-2xl font-bold text-purple-700">{stats.evidence.transferred}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Archived</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.evidence.archived}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;