// Location: /frontend/src/components/evidence/EvidenceDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    FileText, 
    Calendar, 
    User, 
    Hash, 
    Shield,
    Download,
    Printer,
    Share2,
    QrCode
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import EvidenceQRCode from './EvidenceQRCode';

const EvidenceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evidence, setEvidence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        fetchEvidence();
    }, [id]);

    const fetchEvidence = async () => {
        try {
            const response = await api.get(`/evidence/${id}`);
            setEvidence(response.data.evidence);
        } catch (error) {
            toast.error('Failed to fetch evidence details');
            navigate('/evidence');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="govt-loader"></div>
            </div>
        );
    }

    if (!evidence) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Evidence not found</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/evidence')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{evidence.title}</h1>
                        <p className="text-sm text-gray-500">
                            {evidence.evidence_id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <QrCode className="w-5 h-5" />
                    </button>
                    <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                    <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Evidence QR Code</h3>
                            <button
                                onClick={() => setShowQR(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <EvidenceQRCode evidenceId={evidence.evidence_id} evidenceData={evidence} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="govt-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Evidence Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Evidence ID</p>
                                <p className="font-mono text-sm">{evidence.evidence_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evidence.status)}`}>
                                    {evidence.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Case</p>
                                <p className="font-medium">{evidence.case_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Case Title</p>
                                <p>{evidence.case_title || 'N/A'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-gray-700">{evidence.description || 'No description'}</p>
                            </div>
                        </div>
                    </div>

                    {/* File Info */}
                    <div className="govt-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            File Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">File Name</span>
                                <span className="font-medium">{evidence.file_name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">File Size</span>
                                <span>{formatFileSize(evidence.file_size)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">File Type</span>
                                <span>{evidence.mime_type || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500">SHA-256 Hash</span>
                                <span className="font-mono text-xs truncate max-w-xs">
                                    {evidence.sha256_hash || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    {evidence.metadata && (
                        <div className="govt-card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Extracted Metadata
                            </h3>
                            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-60">
                                {JSON.stringify(evidence.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Collection Info */}
                    <div className="govt-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Collection Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Collected By</p>
                                <p className="font-medium">{evidence.collected_by_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Collected Date</p>
                                <p>{formatDate(evidence.collected_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Storage Location</p>
                                <p>{evidence.storage_location || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p>{formatDate(evidence.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Updated</p>
                                <p>{formatDate(evidence.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="govt-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Actions
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/custody/timeline/${evidence.id}`)}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                View Custody Timeline
                            </button>
                            <button
                                onClick={() => navigate(`/custody/verify/${evidence.id}`)}
                                className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Verify Integrity
                            </button>
                            <button
                                onClick={() => navigate(`/custody/transfer`)}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Transfer Custody
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceDetails;