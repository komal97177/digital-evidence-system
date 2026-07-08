// Location: /frontend/src/components/dashboard/ViewerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Eye, 
    FileText, 
    Search, 
    Activity,
    Clock,
    CheckCircle,
    Shield,
    ChevronRight,
    Calendar,
    User,
    FileArchive,
    Filter,
    Bookmark,
    Star,
    TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ViewerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        evidence: { total: 0, viewed: 0, recent: 0 },
        cases: { total: 0, active: 0 },
        bookmarks: { total: 0 }
    });
    const [recentEvidence, setRecentEvidence] = useState([]);
    const [bookmarkedItems, setBookmarkedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [evidenceRes, casesRes, bookmarksRes] = await Promise.all([
                api.get('/evidence'),
                api.get('/cases'),
                api.get('/bookmarks')
            ]);
            
            const evidence = evidenceRes.data.evidence || [];
            const cases = casesRes.data.cases || [];
            
            setStats({
                evidence: {
                    total: evidence.length,
                    viewed: evidence.filter(e => e.viewed).length || 0,
                    recent: evidence.slice(0, 5).length
                },
                cases: {
                    total: cases.length,
                    active: cases.filter(c => c.status !== 'closed').length
                },
                bookmarks: {
                    total: bookmarksRes.data.total || 0
                }
            });
            
            setRecentEvidence(evidence.slice(0, 5));
            setBookmarkedItems(bookmarksRes.data.items || []);
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
            analyzed: 'bg-purple-100 text-purple-800',
            transferred: 'bg-orange-100 text-orange-800',
            archived: 'bg-gray-100 text-gray-800',
            open: 'bg-green-100 text-green-800',
            investigating: 'bg-yellow-100 text-yellow-800',
            closed: 'bg-gray-100 text-gray-800'
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
            <div className="govt-card p-6 bg-gradient-to-r from-gray-800 to-gray-600 text-white rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Viewer Dashboard</h1>
                        <p className="text-gray-300 mt-1">
                            View and review evidence and cases
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => navigate('/evidence/search')}
                            className="flex items-center px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Search Evidence
                        </button>
                        <button
                            onClick={() => navigate('/bookmarks')}
                            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Bookmarks
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
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.evidence.total}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <FileArchive className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/cases')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Cases</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.cases.active}</p>
                            <span className="text-xs text-gray-500">of {stats.cases.total} total</span>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/bookmarks')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Bookmarks</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.bookmarks.total}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Bookmark className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="govt-card p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/evidence')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Recently Viewed</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.evidence.recent}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Eye className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/evidence')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                    <Eye className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-700">Browse Evidence</span>
                </button>
                <button
                    onClick={() => navigate('/cases')}
                    className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-700">View Cases</span>
                </button>
                <button
                    onClick={() => navigate('/evidence/search')}
                    className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                    <Search className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-700">Advanced Search</span>
                </button>
            </div>

            {/* Recent Evidence & Bookmarks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recently Viewed */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            Recently Viewed
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
                        {recentEvidence.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No items viewed recently</p>
                        ) : (
                            recentEvidence.map((item) => (
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

                {/* Bookmarks */}
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Bookmark className="w-5 h-5 mr-2 text-purple-600" />
                            Bookmarks
                        </h3>
                        <button
                            onClick={() => navigate('/bookmarks')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {bookmarkedItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No bookmarks yet</p>
                        ) : (
                            bookmarkedItems.map((item) => (
                                <div 
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                                    onClick={() => navigate(`/evidence/${item.evidence_id}`)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.evidence_id}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.bookmarked_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-medium text-blue-800">Secure Viewing</p>
                    <p className="text-sm text-blue-700">
                        All evidence viewed on this platform is tracked and logged for security purposes.
                        Unauthorized sharing or distribution is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ViewerDashboard;