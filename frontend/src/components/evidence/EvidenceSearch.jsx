// Location: /frontend/src/components/evidence/EvidenceSearch.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    FileText, 
    Clock, 
    Shield, 
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    Calendar,
    Hash,
    Tag,
    User,
    Building2,
    AlertCircle,
    CheckCircle,
    Download,
    Sliders
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EvidenceSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: [],
        case_id: '',
        type: '',
        dateFrom: '',
        dateTo: '',
        hash: '',
        collected_by: '',
        department: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });
    const [savedSearches, setSavedSearches] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [location]);

    const performSearch = async (query = searchQuery) => {
        if (!query.trim() && !Object.values(filters).some(v => v)) {
            toast.warning('Please enter a search term or apply filters');
            return;
        }

        setLoading(true);
        try {
            const params = {
                q: query,
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status.join(','),
                case_id: filters.case_id,
                type: filters.type,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                hash: filters.hash,
                collected_by: filters.collected_by,
                department: filters.department
            };
            
            const response = await api.get('/evidence/search', { params });
            setResults(response.data.results || []);
            setTotalResults(response.data.total || 0);
            setPagination(prev => ({
                ...prev,
                total: response.data.total || 0,
                totalPages: Math.ceil((response.data.total || 0) / prev.limit)
            }));
        } catch (error) {
            toast.error('Search failed');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        performSearch();
        // Update URL
        navigate(`/evidence/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
    };

    const handleClearFilters = () => {
        setFilters({
            status: [],
            case_id: '',
            type: '',
            dateFrom: '',
            dateTo: '',
            hash: '',
            collected_by: '',
            department: ''
        });
        setSearchQuery('');
        navigate('/evidence/search');
    };

    const toggleStatus = (status) => {
        setFilters(prev => ({
            ...prev,
            status: prev.status.includes(status)
                ? prev.status.filter(s => s !== status)
                : [...prev.status, status]
        }));
    };

    const getStatusColor = (status) => {
        const colors = {
            registered: 'bg-blue-100 text-blue-800',
            stored: 'bg-green-100 text-green-800',
            analyzed: 'bg-purple-100 text-purple-800',
            transferred: 'bg-orange-100 text-orange-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() 
                ? <mark key={i} className="bg-yellow-200 px-0.5">{part}</mark>
                : part
        );
    };

    const saveSearch = () => {
        const searchData = {
            id: Date.now(),
            name: searchQuery || 'Search',
            query: searchQuery,
            filters: {...filters},
            timestamp: new Date().toISOString()
        };
        setSavedSearches(prev => [...prev, searchData]);
        toast.success('Search saved');
    };

    const loadSavedSearch = (saved) => {
        setSearchQuery(saved.query);
        setFilters(saved.filters);
        performSearch(saved.query);
    };

    const deleteSavedSearch = (id) => {
        setSavedSearches(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Search className="w-6 h-6 mr-2 text-blue-600" />
                    Evidence Search
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    Search across all evidence with advanced filters
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, description, evidence ID, hash..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Search
                </button>
                <button
                    type="button"
                    onClick={() => setAdvancedOpen(!advancedOpen)}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                    <Sliders className="w-4 h-4 mr-2" />
                    Advanced
                </button>
                <button
                    type="button"
                    onClick={saveSearch}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Save Search
                </button>
            </form>

            {/* Advanced Filters */}
            {advancedOpen && (
                <div className="govt-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <div className="flex flex-wrap gap-2">
                                {['registered', 'stored', 'analyzed', 'transferred', 'archived'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => toggleStatus(status)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                            filters.status.includes(status)
                                                ? getStatusColor(status) + ' border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <div className="flex space-x-2">
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="From"
                                />
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="To"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="image">Images</option>
                                <option value="pdf">PDF</option>
                                <option value="document">Documents</option>
                                <option value="spreadsheet">Spreadsheets</option>
                                <option value="text">Text Files</option>
                                <option value="archive">Archives</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hash (SHA-256)</label>
                            <input
                                type="text"
                                value={filters.hash}
                                onChange={(e) => setFilters({...filters, hash: e.target.value})}
                                placeholder="Enter SHA-256 hash"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Collected By</label>
                            <input
                                type="text"
                                value={filters.collected_by}
                                onChange={(e) => setFilters({...filters, collected_by: e.target.value})}
                                placeholder="Username or name"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input
                                type="text"
                                value={filters.department}
                                onChange={(e) => setFilters({...filters, department: e.target.value})}
                                placeholder="Department name"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Clear Filters
                        </button>
                        <button
                            type="button"
                            onClick={() => performSearch()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {savedSearches.map(saved => (
                        <div key={saved.id} className="flex items-center bg-gray-100 rounded-lg">
                            <button
                                onClick={() => loadSavedSearch(saved)}
                                className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600"
                            >
                                {saved.name}
                            </button>
                            <button
                                onClick={() => deleteSavedSearch(saved.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="govt-loader mx-auto"></div>
                        <p className="mt-4 text-gray-600">Searching...</p>
                    </div>
                </div>
            ) : results.length > 0 ? (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Found {totalResults} result(s) in {pagination.limit * (pagination.page - 1) + 1}-
                            {Math.min(pagination.limit * pagination.page, totalResults)}
                        </p>
                        <button
                            onClick={() => performSearch()}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {results.map((item) => (
                            <div
                                key={item.id}
                                className="govt-card p-4 hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => navigate(`/evidence/${item.id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center flex-wrap gap-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {highlightText(item.title, searchQuery)}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {highlightText(item.description, searchQuery)}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                            <span className="font-mono">{item.evidence_id}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(item.file_size)}</span>
                                            <span>•</span>
                                            <span>{formatDate(item.created_at)}</span>
                                            {item.case_number && (
                                                <>
                                                    <span>•</span>
                                                    <span>Case: {item.case_number}</span>
                                                </>
                                            )}
                                        </div>
                                        {item.sha256_hash && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-400 font-mono truncate">
                                                    Hash: {item.sha256_hash}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-3 md:mt-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/custody/verify/${item.id}`); }}
                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/custody/timeline/${item.id}`); }}
                                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        >
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        {item.file_path && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); window.open(`/uploads/${item.file_path}`, '_blank'); }}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                Page {pagination.page} of {pagination.totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No results found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms or filters</p>
                </div>
            )}
        </div>
    );
};

export default EvidenceSearch;