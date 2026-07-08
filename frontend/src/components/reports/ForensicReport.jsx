// Location: /frontend/src/components/reports/ForensicReport.jsx
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
    Phone,
    Eye,
    Edit,
    Trash2,
    Copy,
    Link,
    BarChart,
    PieChart,
    TrendingUp,
    Filter,
    Search,
    RefreshCw,
    Loader2,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    Table,
    Grid,
    List
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import GeneratePDF from './GeneratePDF';

const ForensicReport = () => {
    const { evidenceId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState(new Set(['overview', 'analysis', 'findings']));

    useEffect(() => {
        generateReport();
    }, [evidenceId]);

    const generateReport = async () => {
        setGenerating(true);
        try {
            const response = await api.get(`/reports/forensic/${evidenceId}`);
            setReport(response.data);
        } catch (error) {
            toast.error('Failed to generate forensic report');
            navigate('/evidence');
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    };

    const getStatusColor = (status) => {
        const colors = {
            verified: 'bg-green-100 text-green-800 border-green-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            warning: 'bg-orange-100 text-orange-800 border-orange-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'verified': return <CheckCircle className="w-4 h-4" />;
            case 'failed': return <XCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const exportReport = async (format = 'pdf') => {
        try {
            const response = await api.get(`/reports/forensic/${evidenceId}/export`, {
                params: { format },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `forensic-report-${report?.evidence?.evidence_id || evidenceId}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error('Failed to export report');
        }
    };

    if (loading || generating) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="govt-loader mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {generating ? 'Generating forensic report...' : 'Loading report...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No forensic report available</p>
                <button
                    onClick={generateReport}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    Generate Report
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/evidence')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-blue-600" />
                            Forensic Report
                        </h1>
                        <p className="text-sm text-gray-600">
                            {report.evidence?.evidence_id} - {report.evidence?.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <button
                        onClick={() => setShowPDFModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate PDF
                    </button>
                    <button
                        onClick={() => exportReport('pdf')}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link copied to clipboard');
                        }}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Link className="w-4 h-4 mr-2" />
                        Share
                    </button>
                </div>
            </div>

            {/* Report Metadata */}
            <div className="govt-card p-4 bg-gray-50 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Report ID</p>
                        <p className="font-mono font-medium">{report.report_id || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Generated</p>
                        <p className="font-medium">{formatDate(report.generated_at)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Generated By</p>
                        <p className="font-medium">{report.generated_by_name || 'System'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            {report.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8 overflow-x-auto">
                    {['overview', 'analysis', 'findings', 'metadata', 'timeline'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                py-3 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors
                                ${activeTab === tab 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Evidence Summary */}
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-blue-600" />
                                Evidence Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    <p className="text-sm text-gray-500">File Size</p>
                                    <p>{formatFileSize(report.evidence?.file_size)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">File Type</p>
                                    <p>{report.evidence?.mime_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Collected By</p>
                                    <p>{report.evidence?.collected_by_name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Integrity Status */}
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                Integrity Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-gray-500">SHA-256 Hash</p>
                                    <p className="font-mono text-sm break-all">{report.evidence?.sha256_hash}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-500">Verification Status</p>
                                    <div className="flex items-center mt-1">
                                        {report.integrity_verified ? (
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                                        )}
                                        <span className={`font-medium ${report.integrity_verified ? 'text-green-700' : 'text-yellow-700'}`}>
                                            {report.integrity_verified ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="govt-card p-4">
                                <p className="text-sm text-gray-500">Total Analysis</p>
                                <p className="text-2xl font-bold text-gray-900">{report.analysis_count || 0}</p>
                            </div>
                            <div className="govt-card p-4 border-green-200">
                                <p className="text-sm text-gray-500">Passed</p>
                                <p className="text-2xl font-bold text-green-600">{report.passed_count || 0}</p>
                            </div>
                            <div className="govt-card p-4 border-red-200">
                                <p className="text-sm text-gray-500">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{report.failed_count || 0}</p>
                            </div>
                            <div className="govt-card p-4 border-yellow-200">
                                <p className="text-sm text-gray-500">Warnings</p>
                                <p className="text-2xl font-bold text-yellow-600">{report.warning_count || 0}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                    <div className="space-y-6">
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <BarChart className="w-5 h-5 mr-2 text-blue-600" />
                                Analysis Results
                            </h3>
                            {report.analysis && report.analysis.length > 0 ? (
                                <div className="space-y-4">
                                    {report.analysis.map((item, index) => (
                                        <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {item.status === 'passed' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : item.status === 'failed' ? (
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-500">{item.description}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            {item.details && (
                                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                    {item.details}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No analysis results available</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Findings Tab */}
                {activeTab === 'findings' && (
                    <div className="space-y-6">
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                Key Findings
                            </h3>
                            {report.findings && report.findings.length > 0 ? (
                                <div className="space-y-4">
                                    {report.findings.map((finding, index) => (
                                        <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                                            <p className="font-medium text-gray-900">{finding.title}</p>
                                            <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                                            {finding.recommendation && (
                                                <p className="text-sm text-blue-700 mt-2">
                                                    <strong>Recommendation:</strong> {finding.recommendation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No findings recorded</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Metadata Tab */}
                {activeTab === 'metadata' && (
                    <div className="space-y-6">
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Hash className="w-5 h-5 mr-2 text-blue-600" />
                                Extracted Metadata
                            </h3>
                            {report.metadata ? (
                                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                                    <pre className="text-xs font-mono whitespace-pre-wrap">
                                        {JSON.stringify(report.metadata, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <p className="text-gray-500">No metadata available</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                    <div className="space-y-6">
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                Analysis Timeline
                            </h3>
                            {report.timeline && report.timeline.length > 0 ? (
                                <div className="space-y-4">
                                    {report.timeline.map((event, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="shrink-0">
                                                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                                                    event.status === 'success' ? 'bg-green-500' :
                                                    event.status === 'failed' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                                }`} />
                                                {index < report.timeline.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 ml-1.5" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="font-medium text-gray-900">{event.action}</p>
                                                <p className="text-sm text-gray-600">{event.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">{formatDate(event.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No timeline events</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* PDF Modal */}
            {showPDFModal && (
                <GeneratePDF
                    report={report}
                    type="forensic"
                    onClose={() => setShowPDFModal(false)}
                    onGenerate={(pdfData) => {
                        // Handle PDF generation
                        toast.success('PDF generated successfully');
                        setShowPDFModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ForensicReport;