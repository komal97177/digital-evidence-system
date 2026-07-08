// Location: /frontend/src/components/reports/InvestigationReport.jsx
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
    List,
    FolderCase,
    Users,
    Activity,
    FileText as FileTextIcon,
    Plus,
    Minus,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import GeneratePDF from './GeneratePDF';

const InvestigationReport = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState(new Set(['overview', 'evidence', 'findings']));

    useEffect(() => {
        generateReport();
    }, [caseId]);

    const generateReport = async () => {
        setGenerating(true);
        try {
            const response = await api.get(`/reports/investigation/${caseId}`);
            setReport(response.data);
        } catch (error) {
            toast.error('Failed to generate investigation report');
            navigate('/cases');
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
            open: 'bg-green-100 text-green-800 border-green-200',
            investigating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            closed: 'bg-gray-100 text-gray-800 border-gray-200',
            archived: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'open': return <CheckCircle className="w-4 h-4" />;
            case 'investigating': return <Clock className="w-4 h-4" />;
            case 'closed': return <XCircle className="w-4 h-4" />;
            case 'archived': return <FileArchive className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-yellow-100 text-yellow-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const exportReport = async (format = 'pdf') => {
        try {
            const response = await api.get(`/reports/investigation/${caseId}/export`, {
                params: { format },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `investigation-report-${report?.case?.case_number || caseId}.${format}`;
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
                        {generating ? 'Generating investigation report...' : 'Loading report...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No investigation report available</p>
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
                        onClick={() => navigate('/cases')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-blue-600" />
                            Investigation Report
                        </h1>
                        <p className="text-sm text-gray-600">
                            {report.case?.case_number} - {report.case?.title}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(report.case?.status)}`}>
                            {getStatusIcon(report.case?.status)}
                            {report.case?.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8 overflow-x-auto">
                    {['overview', 'evidence', 'findings', 'timeline', 'team'].map(tab => (
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
                        {/* Case Summary */}
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FolderCase className="w-5 h-5 mr-2 text-blue-600" />
                                Case Overview
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Case Number</p>
                                    <p className="font-mono font-medium">{report.case?.case_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Title</p>
                                    <p className="font-medium">{report.case?.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Priority</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.case?.priority)}`}>
                                        {report.case?.priority}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="text-gray-700">{report.case?.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Assigned Officer</p>
                                    <p className="font-medium">{report.case?.assigned_officer_name || 'Unassigned'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="govt-card p-4">
                                <p className="text-sm text-gray-500">Total Evidence</p>
                                <p className="text-2xl font-bold text-gray-900">{report.statistics?.totalEvidence || 0}</p>
                            </div>
                            <div className="govt-card p-4 border-green-200">
                                <p className="text-sm text-gray-500">Analyzed</p>
                                <p className="text-2xl font-bold text-green-600">{report.statistics?.analyzed || 0}</p>
                            </div>
                            <div className="govt-card p-4 border-yellow-200">
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{report.statistics?.pending || 0}</p>
                            </div>
                            <div className="govt-card p-4 border-purple-200">
                                <p className="text-sm text-gray-500">Total Actions</p>
                                <p className="text-2xl font-bold text-purple-600">{report.statistics?.totalActions || 0}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Evidence Tab */}
                {activeTab === 'evidence' && (
                    <div className="space-y-6">
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FileArchive className="w-5 h-5 mr-2 text-blue-600" />
                                Evidence Collected
                            </h3>
                            {report.evidence && report.evidence.length > 0 ? (
                                <div className="space-y-3">
                                    {report.evidence.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`/evidence/${item.id}`)}>
                                            <div className="flex items-center space-x-3">
                                                <FileTextIcon className="w-4 h-4 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.title}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{item.evidence_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No evidence collected</p>
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
                                Investigation Findings
                            </h3>
                            {report.findings && report.findings.length > 0 ? (
                                <div className="space-y-4">
                                    {report.findings.map((finding, index) => (
                                        <div key={index} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                                            <p className="font-medium text-gray-900">{finding.title}</p>
                                            <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                                            {finding.evidence && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    <strong>Evidence:</strong> {finding.evidence}
                                                </p>
                                            )}
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

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                    <div className="space-y-6">
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                Investigation Timeline
                            </h3>
                            {report.timeline && report.timeline.length > 0 ? (
                                <div className="space-y-4">
                                    {report.timeline.map((event, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="shrink-0">
                                                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                                                    event.type === 'evidence' ? 'bg-blue-500' :
                                                    event.type === 'finding' ? 'bg-yellow-500' :
                                                    event.type === 'action' ? 'bg-green-500' :
                                                    'bg-gray-500'
                                                }`} />
                                                {index < report.timeline.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 ml-1.5" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-medium text-gray-900">{event.action}</p>
                                                    <span className="text-xs text-gray-400">{formatDate(event.timestamp)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{event.description}</p>
                                                {event.user && (
                                                    <p className="text-xs text-gray-500 mt-1">By: {event.user}</p>
                                                )}
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

                {/* Team Tab */}
                {activeTab === 'team' && (
                    <div className="space-y-6">
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-600" />
                                Investigation Team
                            </h3>
                            {report.team && report.team.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {report.team.map((member, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                {member.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                                <p className="text-sm text-gray-500">{member.role}</p>
                                                {member.department && (
                                                    <p className="text-xs text-gray-400">{member.department}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No team members assigned</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* PDF Modal */}
            {showPDFModal && (
                <GeneratePDF
                    report={report}
                    type="investigation"
                    onClose={() => setShowPDFModal(false)}
                    onGenerate={(pdfData) => {
                        toast.success('PDF generated successfully');
                        setShowPDFModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default InvestigationReport;