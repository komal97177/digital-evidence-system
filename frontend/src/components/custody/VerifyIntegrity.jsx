// Location: /frontend/src/components/custody/VerifyIntegrity.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Shield, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    ArrowLeft,
    FileText,
    Clock,
    Hash,
    Calendar,
    User,
    RefreshCw,
    Download,
    Printer
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const VerifyIntegrity = () => {
    const { evidenceId } = useParams();
    const navigate = useNavigate();
    const [evidence, setEvidence] = useState(null);
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchEvidence();
        fetchVerificationHistory();
    }, [evidenceId]);

    const fetchEvidence = async () => {
        try {
            const response = await api.get(`/evidence/${evidenceId}`);
            setEvidence(response.data.evidence);
        } catch (error) {
            toast.error('Failed to fetch evidence');
            navigate('/evidence');
        } finally {
            setLoading(false);
        }
    };

    const fetchVerificationHistory = async () => {
        try {
            const response = await api.get(`/custody/timeline/${evidenceId}`);
            const verifications = response.data.timeline.filter(t => t.action === 'verified');
            setHistory(verifications);
        } catch (error) {
            console.error('Failed to fetch verification history');
        }
    };

    const verifyIntegrity = async () => {
        setVerifying(true);
        try {
            const response = await api.post(`/evidence/${evidenceId}/verify`);
            setVerification(response.data);
            
            if (response.data.integrity) {
                toast.success('✅ Integrity verified successfully!');
            } else {
                toast.error('❌ Integrity verification failed!');
            }
            
            // Refresh history
            await fetchVerificationHistory();
        } catch (error) {
            toast.error('Verification failed');
            setVerification({
                integrity: false,
                error: error.response?.data?.error || 'Verification failed'
            });
        } finally {
            setVerifying(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    };

    const getStatusColor = (integrity) => {
        if (integrity === undefined) return 'bg-gray-100 text-gray-800';
        return integrity ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getStatusIcon = (integrity) => {
        if (integrity === undefined) return <Clock className="w-6 h-6 text-gray-400" />;
        return integrity ? 
            <CheckCircle className="w-6 h-6 text-green-600" /> : 
            <XCircle className="w-6 h-6 text-red-600" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="govt-loader mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading evidence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
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
                        <h1 className="text-2xl font-bold text-gray-900">Verify Integrity</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {evidence?.evidence_id} - {evidence?.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={verifyIntegrity}
                        disabled={verifying}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {verifying ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <Shield className="w-4 h-4 mr-2" />
                                Verify Now
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Verification Result */}
            {verification && (
                <div className={`govt-card p-6 mb-6 border-l-4 ${
                    verification.integrity ? 'border-green-500' : 'border-red-500'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {getStatusIcon(verification.integrity)}
                            <div>
                                <h3 className={`text-lg font-bold ${
                                    verification.integrity ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {verification.integrity ? '✅ Integrity Verified' : '❌ Integrity Failed'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Verified at: {formatDate(verification.verified_at)}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.integrity)}`}>
                            {verification.integrity ? 'Verified' : 'Compromised'}
                        </span>
                    </div>

                    {verification.error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                            {verification.error}
                        </div>
                    )}

                    {verification.expected_hash && verification.current_hash && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Expected Hash</p>
                                <p className="font-mono text-xs break-all">{verification.expected_hash}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Current Hash</p>
                                <p className="font-mono text-xs break-all">{verification.current_hash}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Evidence Details */}
            <div className="govt-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Evidence Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Evidence ID</p>
                        <p className="font-mono font-medium">{evidence?.evidence_id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Title</p>
                        <p className="font-medium">{evidence?.title}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Case</p>
                        <p>{evidence?.case_number || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            evidence?.status === 'stored' ? 'bg-green-100 text-green-800' :
                            evidence?.status === 'transferred' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {evidence?.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">File Size</p>
                        <p>{evidence?.file_size ? (evidence.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">File Type</p>
                        <p>{evidence?.mime_type || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Collected By</p>
                        <p>{evidence?.collected_by_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Collected Date</p>
                        <p>{formatDate(evidence?.collected_date)}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">SHA-256 Hash</p>
                        <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                            {evidence?.sha256_hash || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Verification History */}
            {history.length > 0 && (
                <div className="govt-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-600" />
                        Verification History
                    </h3>
                    <div className="space-y-3">
                        {history.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {item.hash_before === item.hash_after ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    <div>
                                        <p className={`text-sm font-medium ${
                                            item.hash_before === item.hash_after ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {item.hash_before === item.hash_after ? 'Verified' : 'Failed'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(item.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {item.from_username || 'System'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
                <button
                    onClick={() => window.print()}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Report
                </button>
                <button
                    onClick={() => {
                        const data = {
                            evidence,
                            verification,
                            history,
                            verifiedAt: new Date().toISOString()
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `integrity-report-${evidence?.evidence_id}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success('Report downloaded');
                    }}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                </button>
            </div>
        </div>
    );
};

export default VerifyIntegrity;