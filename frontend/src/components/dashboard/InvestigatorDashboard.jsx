// Location: /frontend/src/components/dashboard/InvestigatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FolderCase, 
    FileText, 
    Search, 
    Plus,
    Clock,
    AlertCircle,
    CheckCircle,
    Calendar,
    User,
    FileArchive,
    Upload,
    Eye,
    Activity,
    TrendingUp,
    Filter,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const InvestigatorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        cases: { total: 0, open: 0, investigating: 0, closed: 0 },
        evidence: { total: 0, myCases: 0, pending: 0 },
        recentCases: [],
        recentEvidence: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [casesRes, evidenceRes] = await Promise.all([
                api.get('/cases'),
                api.get('/evidence')
            ]);
            
            const cases = casesRes.data.cases || [];
            const evidence = evidenceRes.data.evidence || [];
            
            setStats({
                cases: {
                    total: cases.length,
                    open: cases.filter(c => c.status === 'open').length,
                    investigating: cases.filter(c => c.status === 'investigating').length,
                    closed: cases.filter(c => c.status === 'closed').length
                },
                evidence: {
                    total: evidence.length,
                    myCases: evidence.filter(e => e.collected_by === 1).length, // Will be replaced with actual user ID
                    pending: evidence.filter(e => e.status === 'registered').length
                },
                recentCases: cases.slice(0, 5),
                recentEvidence: evidence.slice(0, 5)
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-green-100 text-green-800 border-green-200',
            investigating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            closed: 'bg-gray-100 text-gray-800 border-gray-200',
            registered: 'bg-blue-100 text-blue-800 border-blue-200',
            stored: 'bg-green-100 text-green-800 border-green-200',
            analyzed: 'bg-purple-100 text-purple-800 border-purple-200',
            transferred: 'bg-orange-100 text-orange-800 border-orange-200'
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
            <div className="govt-card p-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Investigator Dashboard</h1>
                        <p className="text-blue-100 mt-1">
                            Manage your investigations and evidence
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => navigate('/cases/create')}
                            className="flex items-center px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Case
                        </button>
                        <button
                            onClick={() => navigate('/evidence/upload')}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border border-blue-500"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Evidence
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/cases')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Cases</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.cases.total}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <FolderCase className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/cases?status=open')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Cases</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.cases.open + stats.cases.investigating}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/evidence')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Evidence</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.evidence.total}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/evidence?status=registered')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Review</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.evidence.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/evidence/search')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                    <Search className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-700">Search Evidence</span>
                </button>
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-700">View Reports</span>
                </button>
                <button
                    onClick={() => navigate('/analyzer/analytics')}
                    className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-700">Analytics</span>
                </button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Cases */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <FolderCase className="w-5 h-5 mr-2 text-blue-600" />
                            Recent Cases
                        </h3>
                        <button
                            onClick={() => navigate('/cases')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stats.recentCases.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No cases assigned</p>
                        ) : (
                            stats.recentCases.map((caseItem) => (
                                <div 
                                    key={caseItem.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{caseItem.title}</p>
                                        <p className="text-xs text-gray-500">{caseItem.case_number}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                                        {caseItem.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Evidence */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Recent Evidence
                        </h3>
                        <button
                            onClick={() => navigate('/evidence')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stats.recentEvidence.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No evidence added</p>
                        ) : (
                            stats.recentEvidence.map((item) => (
                                <div 
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/evidence/${item.id}`)}
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.evidence_id}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {item.status}
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

export default InvestigatorDashboard;