// Location: /frontend/src/components/dashboard/AnalyzerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Microscope, 
    FileText, 
    BarChart, 
    Activity,
    CheckCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    Download,
    Filter,
    Search,
    ChevronRight,
    Calendar,
    User,
    FileArchive,
    Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AnalyzerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        evidence: { total: 0, analyzed: 0, pending: 0, inProgress: 0 },
        reports: { total: 0, generated: 0, pending: 0 },
        analyses: { total: 0, completed: 0, failed: 0 }
    });
    const [pendingAnalyses, setPendingAnalyses] = useState([]);
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [evidenceRes, reportsRes, analysesRes] = await Promise.all([
                api.get('/evidence'),
                api.get('/reports/forensic'),
                api.get('/analyses')
            ]);
            
            const evidence = evidenceRes.data.evidence || [];
            
            setStats({
                evidence: {
                    total: evidence.length,
                    analyzed: evidence.filter(e => e.status === 'analyzed').length,
                    pending: evidence.filter(e => e.status === 'registered' || e.status === 'stored').length,
                    inProgress: evidence.filter(e => e.status === 'transferred').length
                },
                reports: {
                    total: reportsRes.data.total || 0,
                    generated: reportsRes.data.generated || 0,
                    pending: reportsRes.data.pending || 0
                },
                analyses: {
                    total: analysesRes.data.total || 0,
                    completed: analysesRes.data.completed || 0,
                    failed: analysesRes.data.failed || 0
                }
            });
            
            setPendingAnalyses(analysesRes.data.pending || []);
            setRecentReports(reportsRes.data.recent || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            inProgress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            analyzed: 'bg-purple-100 text-purple-800',
            registered: 'bg-gray-100 text-gray-800',
            stored: 'bg-blue-100 text-blue-800'
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
            <div className="govt-card p-6 bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Analyzer Dashboard</h1>
                        <p className="text-purple-100 mt-1">
                            Forensic analysis and reporting
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => navigate('/analyzer/forensic')}
                            className="flex items-center px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                            <Microscope className="w-4 h-4 mr-2" />
                            New Analysis
                        </button>
                        <button
                            onClick={() => navigate('/reports')}
                            className="flex items-center px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/evidence')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Evidence</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.evidence.total}</p>
                            <span className="text-xs text-green-500">{stats.evidence.analyzed} analyzed</span>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <FileArchive className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/analyzer/forensic')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Analysis</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.evidence.pending}</p>
                            <span className="text-xs text-blue-500">{stats.evidence.inProgress} in progress</span>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/reports')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Reports</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.reports.total}</p>
                            <span className="text-xs text-gray-500">{stats.reports.pending} pending</span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/analyzer/analytics')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Analyses</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.analyses.completed}</p>
                            <span className="text-xs text-gray-500">of {stats.analyses.total} total</span>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/analyzer/forensic')}
                    className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                    <Microscope className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-700">Forensic Analysis</span>
                </button>
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-700">Generate Report</span>
                </button>
                <button
                    onClick={() => navigate('/analyzer/analytics')}
                    className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                    <BarChart className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-700">Analytics Dashboard</span>
                </button>
            </div>

            {/* Pending Analyses & Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Analyses */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Microscope className="w-5 h-5 mr-2 text-purple-600" />
                            Pending Analyses
                        </h3>
                        <button
                            onClick={() => navigate('/analyzer/forensic')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {pendingAnalyses.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending analyses</p>
                        ) : (
                            pendingAnalyses.map((analysis) => (
                                <div 
                                    key={analysis.id}
                                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{analysis.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {analysis.evidence_id} · Priority: {analysis.priority}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/analyzer/forensic/${analysis.id}`)}
                                        className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                                    >
                                        Analyze
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Recent Reports
                        </h3>
                        <button
                            onClick={() => navigate('/reports')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentReports.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No reports generated</p>
                        ) : (
                            recentReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`/reports/${report.id}`)}>
                                    <div>
                                        <p className="font-medium text-gray-900">{report.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {report.evidence_id} · {new Date(report.generated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                        {report.status}
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

export default AnalyzerDashboard;