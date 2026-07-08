// Location: /frontend/src/components/reports/DashboardAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    PieChart,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    FileText,
    FolderCase,
    Shield,
    Clock,
    Calendar,
    Filter,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Eye,
    FileArchive,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    ArrowUp,
    ArrowDown,
    DollarSign,
    Percent,
    Grid,
    List,
    Search,
    MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
    LineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    ScatterChart,
    Scatter,
    ComposedChart
} from 'recharts';

const DashboardAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('30d');
    const [analytics, setAnalytics] = useState({
        overview: {
            totalCases: 0,
            totalEvidence: 0,
            totalUsers: 0,
            totalTransfers: 0,
            growth: 0
        },
        trends: {
            cases: [],
            evidence: [],
            custody: []
        },
        distribution: {
            status: [],
            priority: [],
            type: [],
            department: []
        },
        performance: {
            resolutionTime: 0,
            avgTransfers: 0,
            successRate: 0,
            activeUsers: 0
        },
        topPerformers: [],
        recentActivity: []
    });
    const [chartView, setChartView] = useState('cases');
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 60000);
        return () => clearInterval(interval);
    }, [timeframe]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/analytics/dashboard', {
                params: { timeframe }
            });
            setAnalytics(response.data);
        } catch (error) {
            toast.error('Failed to fetch analytics data');
            console.error('Analytics Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0a1a3a', '#1a3a6a', '#d4a847', '#c41e3a', '#2e7d32', '#6b4c3b', '#1a7a7a', '#8b5cf6'];

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getTrendColor = (value) => {
        if (value > 0) return 'text-green-600 bg-green-50';
        if (value < 0) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getTrendIcon = (value) => {
        if (value > 0) return <ArrowUp className="w-4 h-4" />;
        if (value < 0) return <ArrowDown className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="govt-loader mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <BarChart className="w-6 h-6 mr-2 text-blue-600" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Real-time insights and performance metrics
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="365d">Last Year</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            toast.info('Exporting analytics data...');
                        }}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="govt-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Cases</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalCases)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTrendColor(analytics.overview.growth)}`}>
                                {getTrendIcon(analytics.overview.growth)}
                                {Math.abs(analytics.overview.growth)}% growth
                            </span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <FolderCase className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Evidence</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalEvidence)}</p>
                            <span className="text-xs text-green-600">+12% this month</span>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalUsers)}</p>
                            <span className="text-xs text-blue-600">+8 this week</span>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Custody Transfers</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalTransfers)}</p>
                            <span className="text-xs text-orange-600">+5% this month</span>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Shield className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="govt-card p-4">
                    <p className="text-sm text-gray-500">Avg Resolution Time</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.performance.resolutionTime || 0}h</p>
                    <span className="text-xs text-green-600">↓ 8% faster</span>
                </div>
                <div className="govt-card p-4">
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.performance.successRate || 0}%</p>
                    <span className="text-xs text-green-600">↑ 2% improvement</span>
                </div>
                <div className="govt-card p-4">
                    <p className="text-sm text-gray-500">Avg Transfers per Evidence</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.performance.avgTransfers || 0}</p>
                    <span className="text-xs text-gray-500">Normal range</span>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-600" />
                            Trends
                        </h3>
                        <div className="flex items-center space-x-2">
                            <select
                                value={chartView}
                                onChange={(e) => setChartView(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="cases">Cases</option>
                                <option value="evidence">Evidence</option>
                                <option value="custody">Custody</option>
                            </select>
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="line">Line</option>
                                <option value="bar">Bar</option>
                                <option value="area">Area</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' ? (
                                <LineChart data={analytics.trends[chartView] || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#0a1a3a" strokeWidth={2} />
                                </LineChart>
                            ) : chartType === 'bar' ? (
                                <RechartsBarChart data={analytics.trends[chartView] || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#0a1a3a" />
                                </RechartsBarChart>
                            ) : (
                                <AreaChart data={analytics.trends[chartView] || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="count" stroke="#0a1a3a" fill="#0a1a3a" fillOpacity={0.1} />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="govt-card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                        Distribution by Status
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={analytics.distribution.status || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {analytics.distribution.status?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Distribution */}
                <div className="govt-card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                        Priority Distribution
                    </h3>
                    <div className="space-y-3">
                        {analytics.distribution.priority?.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{item.name}</span>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                        className={`h-2 rounded-full ${item.name === 'critical' ? 'bg-red-500' :
                                            item.name === 'high' ? 'bg-orange-500' :
                                            item.name === 'medium' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                        }`}
                                        style={{ width: `${(item.value / analytics.overview.totalCases) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="govt-card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                        Top Departments
                    </h3>
                    <div className="space-y-3">
                        {analytics.distribution.department?.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">{item.name}</span>
                                <span className="text-sm font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="govt-card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Top Performers
                    </h3>
                    <div className="space-y-3">
                        {analytics.topPerformers?.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.role}</p>
                                </div>
                                <span className="text-sm font-medium text-green-600">{item.count} actions</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="govt-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-600" />
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
                    {analytics.recentActivity?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                    ) : (
                        analytics.recentActivity?.slice(0, 10).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-1.5 rounded-full ${
                                        activity.type === 'evidence' ? 'bg-purple-100' :
                                        activity.type === 'case' ? 'bg-blue-100' :
                                        activity.type === 'custody' ? 'bg-indigo-100' :
                                        'bg-gray-100'
                                    }`}>
                                        {activity.type === 'evidence' && <FileText className="w-4 h-4 text-purple-600" />}
                                        {activity.type === 'case' && <FolderCase className="w-4 h-4 text-blue-600" />}
                                        {activity.type === 'custody' && <Shield className="w-4 h-4 text-indigo-600" />}
                                        {activity.type === 'user' && <Users className="w-4 h-4 text-green-600" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-xs text-gray-500">{activity.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                    {activity.user && (
                                        <p className="text-xs text-gray-400">by {activity.user}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;