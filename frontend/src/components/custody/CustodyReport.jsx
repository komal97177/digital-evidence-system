// Location: /frontend/src/components/custody/CustodyReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    FileText, 
    Download, 
    Printer, 
    Share2,
    Shield,
    User,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Hash,
    FileArchive,
    Building2,
    Mail,
    Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CustodyReport = () => {
    const { evidenceId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        generateReport();
    }, [evidenceId]);

    const generateReport = async () => {
        setGenerating(true);
        try {
            const response = await api.get(`/custody/report/${evidenceId}`);
            setReport(response.data);
        } catch (error) {
            toast.error('Failed to generate report');
            navigate('/evidence');
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    const exportReport = async (format = 'pdf') => {
        try {
            const response = await api.get(`/custody/report/${evidenceId}/export`, {
                params: { format },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `custody-report-${report?.evidence?.evidence_id || evidenceId}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error('Failed to export report');
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    };

    const getStatusColor = (status) => {
        const colors = {
            registered: 'bg-blue-100 text-blue-800',
            stored: 'bg-green-100 text-green-800',
            transferred: 'bg-purple-100 text-purple-800',
            verified: 'bg-indigo-100 text-indigo-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getActionBadge = (action) => {
        const colors = {
            registered: 'bg-blue-100 text-blue-800',
            uploaded: 'bg-green-100 text-green-800',
            stored: 'bg-green-100 text-green-800',
            transferred: 'bg-purple-100 text-purple-800',
            viewed: 'bg-gray-100 text-gray-800',
            analyzed: 'bg-orange-100 text-orange-800',
            verified: 'bg-indigo-100 text-indigo-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    if (loading || generating) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="govt-loader mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {generating ? 'Generating report...' : 'Loading report...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No report data available</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Report Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/evidence')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Custody Report</h1>
                        <p className="text-sm text-gray-600">
                            {report.evidence?.evidence_id} - {report.evidence?.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => exportReport('pdf')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                    </button>
                    <button
                        onClick={() => exportReport('csv')}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </button>
                </div>
            </div>

            {/* Report Metadata */}
            <div className="govt-card p-4 bg-gray-50 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Report Generated</p>
                        <p className="font-medium">{formatDate(report.report_generated)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Report ID</p>
                        <p className="font-mono">{report.report_id || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Total Events</p>
                        <p className="font-medium">{report.custody_timeline?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.evidence?.status)}`}>
                            {report.evidence?.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Evidence Information */}
            <div className="govt-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Evidence Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Evidence ID</p>
                        <p className="font-mono font-medium">{report.evidence?.evidence_id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Title</p>
                        <p className="font-medium">{report.evidence?.title}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Case</p>
                        <p>{report.evidence?.case_number || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Collected By</p>
                        <p>{report.evidence?.collected_by_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Collected Date</p>
                        <p>{formatDate(report.evidence?.collected_date)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Storage Location</p>
                        <p>{report.evidence?.storage_location || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">File Size</p>
                        <p>{report.evidence?.file_size ? (report.evidence.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">File Type</p>
                        <p>{report.evidence?.mime_type || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-3">
                        <p className="text-sm text-gray-500">SHA-256 Hash</p>
                        <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                            {report.evidence?.sha256_hash || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Custody Timeline */}
            <div className="govt-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Custody Timeline
                </h3>
                
                {report.custody_timeline?.length === 0 ? (
                    <p className="text-gray-500">No custody events recorded</p>
                ) : (
                    <div className="space-y-4">
                        {report.custody_timeline.map((event, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionBadge(event.action)}`}>
                                        <span className="text-lg">
                                            {event.action === 'registered' && '📋'}
                                            {event.action === 'uploaded' && '📤'}
                                            {event.action === 'stored' && '📁'}
                                            {event.action === 'transferred' && '🔄'}
                                            {event.action === 'viewed' && '👁️'}
                                            {event.action === 'analyzed' && '🔬'}
                                            {event.action === 'verified' && '✅'}
                                            {event.action === 'archived' && '📦'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionBadge(event.action)}`}>
                                            {event.action.toUpperCase()}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(event.created_at)}
                                        </span>
                                    </div>
                                    {event.from_user_id && event.to_user_id && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            <User className="w-3 h-3 inline mr-1" />
                                            {event.from_username || 'System'} → {event.to_username || 'System'}
                                        </p>
                                    )}
                                    {event.notes && (
                                        <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                                    )}
                                    {event.hash_before && event.hash_after && (
                                        <div className="mt-2 text-xs">
                                            <p className="text-gray-500">Hash: {event.hash_before === event.hash_after ? '✅' : '❌'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Access History */}
            {report.access_history?.length > 0 && (
                <div className="govt-card p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Access History
                    </h3>
                    <div className="space-y-2">
                        {report.access_history.map((access, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{access.username}</p>
                                    <p className="text-sm text-gray-500">{access.access_type}</p>
                                </div>
                                <p className="text-sm text-gray-500">{formatDate(access.accessed_at)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Report Footer */}
            <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
                <p>This is a system-generated report from the Digital Evidence Management System</p>
                <p>Generated on: {formatDate(new Date())}</p>
                <p>Report ID: {report.report_id || 'N/A'}</p>
                <p className="mt-1">© {new Date().getFullYear()} Ministry of Home Affairs</p>
            </div>
        </div>
    );
};

export default CustodyReport;