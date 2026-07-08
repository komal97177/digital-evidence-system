// Location: /frontend/src/components/evidence/EvidenceList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    Plus, 
    FileText, 
    Clock, 
    Shield, 
    Eye,
    Download,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EvidenceList = () => {
    const navigate = useNavigate();
    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        case_id: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    useEffect(() => {
        fetchEvidence();
    }, [filters, pagination.page]);

    const fetchEvidence = async () => {
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                status: filters.status !== 'all' ? filters.status : undefined
            };
            const response = await api.get('/evidence', { params });
            setEvidence(response.data.evidence);
            setPagination(prev => ({
                ...prev,
                total: response.data.count
            }));
        } catch (error) {
            toast.error('Failed to fetch evidence');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            registered: 'bg-gray-100 text-gray-800',
            stored: 'bg-blue-100 text-blue-800',
            analyzed: 'bg-purple-100 text-purple-800',
            transferred: 'bg-yellow-100 text-yellow-800',
            archived: 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evidence Management</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage and track all digital evidence
                    </p>
                </div>
                <button
                    onClick={() => navigate('/evidence/upload')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Evidence
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search evidence..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="registered">Registered</option>
                    <option value="stored">Stored</option>
                    <option value="analyzed">Analyzed</option>
                    <option value="transferred">Transferred</option>
                    <option value="archived">Archived</option>
                </select>
                <button
                    onClick={fetchEvidence}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Filter className="w-4 h-4 inline mr-2" />
                    Apply Filters
                </button>
            </div>

            {/* Evidence Table */}
            <div className="govt-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Evidence ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Case
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8">
                                        <div className="govt-loader mx-auto"></div>
                                    </td>
                                </tr>
                            ) : evidence.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                        No evidence found
                                    </td>
                                </tr>
                            ) : (
                                evidence.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-blue-600">
                                                {item.evidence_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {item.case_number || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatFileSize(item.file_size)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/evidence/${item.id}`)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/custody/verify/${item.id}`)}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Verify Integrity"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                                {item.file_path && (
                                                    <button
                                                        onClick={() => window.open(`/uploads/${item.file_path}`, '_blank')}
                                                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} entries
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPagination(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceList;