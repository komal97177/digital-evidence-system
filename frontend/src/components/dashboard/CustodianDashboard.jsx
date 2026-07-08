// Location: /frontend/src/components/dashboard/CustodianDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Shield, 
    FileText, 
    Users, 
    Activity,
    CheckCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    Transfer,
    Archive,
    Eye,
    Search,
    Filter,
    ChevronRight,
    Calendar,
    UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CustodianDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        evidence: { total: 0, inCustody: 0, transferred: 0, pending: 0 },
        transfers: { total: 0, today: 0, pending: 0 },
        verifications: { total: 0, passed: 0, failed: 0 }
    });
    const [pendingTransfers, setPendingTransfers] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [evidenceRes, transfersRes, timelineRes] = await Promise.all([
                api.get('/evidence'),
                api.get('/custody/pending'),
                api.get('/custody/recent')
            ]);
            
            const evidence = evidenceRes.data.evidence || [];
            
            setStats({
                evidence: {
                    total: evidence.length,
                    inCustody: evidence.filter(e => e.status === 'stored').length,
                    transferred: evidence.filter(e => e.status === 'transferred').length,
                    pending: evidence.filter(e => e.status === 'registered').length
                },
                transfers: {
                    total: transfersRes.data.total || 0,
                    today: transfersRes.data.today || 0,
                    pending: transfersRes.data.pending || 0
                },
                verifications: {
                    total: timelineRes.data.verifications || 0,
                    passed: timelineRes.data.passed || 0,
                    failed: timelineRes.data.failed || 0
                }
            });
            
            setPendingTransfers(transfersRes.data.pendingList || []);
            setRecentActivity(timelineRes.data.recent || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            registered: 'bg-blue-100 text-blue-800',
            stored: 'bg-green-100 text-green-800',
            transferred: 'bg-purple-100 text-purple-800',
            pending: 'bg-yellow-100 text-yellow-800',
            passed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
            <div className="govt-card p-6 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Custodian Dashboard</h1>
                        <p className="text-green-100 mt-1">
                            Manage evidence custody and integrity
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => navigate('/custody/transfer')}
                            className="flex items-center px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                        >
                            <Transfer className="w-4 h-4 mr-2" />
                            Transfer Custody
                        </button>
                        <button
                            onClick={() => navigate('/custody/verify')}
                            className="flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Verify Integrity
                        </button>
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
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/evidence')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">In Custody</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.evidence.inCustody}</p>
                            <span className="text-xs text-gray-500">of {stats.evidence.total} total</span>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/custody/transfer')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Transfers</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.transfers.pending}</p>
                            <span className="text-xs text-gray-500">{stats.transfers.today} today</span>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/custody/verify')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Verifications</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.verifications.total}</p>
                            <span className="text-xs text-green-500">{stats.verifications.passed} passed</span>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/evidence?status=transferred')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Transferred</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.evidence.transferred}</p>
                            <span className="text-xs text-gray-500">Total transfers</span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Transfer className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/custody/transfer')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                    <Transfer className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-700">Transfer Custody</span>
                </button>
                <button
                    onClick={() => navigate('/custody/verify')}
                    className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-700">Verify Integrity</span>
                </button>
                <button
                    onClick={() => navigate('/evidence')}
                    className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-700">View All Evidence</span>
                </button>
            </div>

            {/* Pending Transfers & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Transfers */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                            Pending Transfers
                        </h3>
                        <button
                            onClick={() => navigate('/custody/transfer')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {pendingTransfers.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending transfers</p>
                        ) : (
                            pendingTransfers.map((transfer) => (
                                <div 
                                    key={transfer.id}
                                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{transfer.evidence_title}</p>
                                        <p className="text-xs text-gray-500">
                                            From: {transfer.from_user} → To: {transfer.to_user}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/custody/transfer/${transfer.id}`)}
                                        className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                                    >
                                        Process
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-600" />
                            Recent Activity
                        </h3>
                        <button
                            onClick={() => navigate('/custody/timeline')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent activity</p>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-1.5 rounded-full ${
                                            activity.type === 'transfer' ? 'bg-purple-100' :
                                            activity.type === 'verify' ? 'bg-indigo-100' :
                                            'bg-gray-100'
                                        }`}>
                                            {activity.type === 'transfer' ? <Transfer className="w-4 h-4 text-purple-600" /> :
                                             activity.type === 'verify' ? <Shield className="w-4 h-4 text-indigo-600" /> :
                                             <Eye className="w-4 h-4 text-gray-600" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                            <p className="text-xs text-gray-500">{activity.evidence}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(activity.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustodianDashboard;