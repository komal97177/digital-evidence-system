// Location: /frontend/src/components/evidence/BulkUpload.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
    Upload, 
    File, 
    X, 
    CheckCircle, 
    AlertCircle, 
    FileText,
    Image,
    FileArchive,
    FileCode,
    FileJson,
    Shield,
    Calendar,
    User,
    Building2,
    ArrowLeft,
    Loader2,
    Plus,
    Trash2,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const BulkUpload = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [currentCase, setCurrentCase] = useState('');
    const [expandedFiles, setExpandedFiles] = useState(new Set());

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
                status: 'pending',
                metadata: {
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    description: '',
                    collected_date: new Date().toISOString().split('T')[0]
                }
            }))]);
        },
        maxSize: 500 * 1024 * 1024,
        maxFiles: 50,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'text/csv': ['.csv'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/zip': ['.zip'],
            'application/x-rar-compressed': ['.rar'],
            'application/json': ['.json'],
            'application/xml': ['.xml']
        },
        onDropRejected: (fileRejections) => {
            const errors = fileRejections.map(rejection => ({
                name: rejection.file.name,
                errors: rejection.errors.map(e => e.message)
            }));
            toast.error(`Failed to upload: ${errors[0].errors.join(', ')}`);
        }
    });

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateFileMetadata = (index, field, value) => {
        setFiles(prev => prev.map((f, i) => 
            i === index ? {...f, metadata: {...f.metadata, [field]: value}} : f
        ));
    };

    const toggleExpand = (index) => {
        setExpandedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    const validateAll = () => {
        let isValid = true;
        const errors = [];
        
        files.forEach((file, index) => {
            if (!file.metadata.title) {
                errors.push(`File ${index + 1}: Title is required`);
                isValid = false;
            }
        });

        if (!currentCase) {
            errors.push('Please select a case for all files');
            isValid = false;
        }

        if (!isValid) {
            toast.error(errors.join('\n'));
        }
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateAll()) return;
        
        setUploading(true);
        setUploadProgress(0);
        const totalFiles = files.length;
        let uploaded = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const fileItem = files[i];
                
                // Register evidence
                const evidenceData = {
                    case_id: currentCase,
                    title: fileItem.metadata.title,
                    description: fileItem.metadata.description || '',
                    collected_date: fileItem.metadata.collected_date || new Date().toISOString().split('T')[0],
                    storage_location: fileItem.metadata.storage_location || ''
                };
                
                const evidenceRes = await api.post('/evidence/register', evidenceData);
                const evidenceId = evidenceRes.data.evidence.id;

                // Upload file
                const formData = new FormData();
                formData.append('evidence_id', evidenceId);
                formData.append('file', fileItem.file);

                await api.post('/evidence/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            ((i + progressEvent.loaded / progressEvent.total) / totalFiles) * 100
                        );
                        setUploadProgress(percentCompleted);
                        setFiles(prev => prev.map((f, idx) => 
                            idx === i ? {...f, progress: Math.round((progressEvent.loaded / progressEvent.total) * 100)} : f
                        ));
                    }
                });

                uploaded++;
                setFiles(prev => prev.map((f, idx) => 
                    idx === i ? {...f, status: 'uploaded', progress: 100} : f
                ));
            }

            toast.success(`Successfully uploaded ${uploaded} file(s)!`);
            setTimeout(() => navigate('/evidence'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Bulk upload failed');
            setFiles(prev => prev.map(f => 
                f.status === 'pending' ? {...f, status: 'failed'} : f
            ));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
        if (type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (type?.includes('word') || type?.includes('document')) return <FileText className="w-5 h-5 text-blue-500" />;
        if (type?.includes('excel') || type?.includes('spreadsheet')) return <FileText className="w-5 h-5 text-green-500" />;
        if (type?.includes('zip') || type?.includes('rar')) return <FileArchive className="w-5 h-5 text-yellow-500" />;
        if (type?.includes('json')) return <FileJson className="w-5 h-5 text-orange-500" />;
        if (type?.includes('text')) return <FileCode className="w-5 h-5 text-gray-500" />;
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-gray-100 text-gray-600',
            uploading: 'bg-blue-100 text-blue-600',
            uploaded: 'bg-green-100 text-green-600',
            failed: 'bg-red-100 text-red-600'
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => navigate('/evidence')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Evidence</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload multiple evidence files at once
                    </p>
                </div>
            </div>

            {/* Upload Area */}
            <div className="govt-card p-6">
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                    `}
                >
                    <input {...getInputProps()} />
                    <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-lg text-gray-600">
                        {isDragActive ? (
                            'Drop files here...'
                        ) : (
                            <>
                                <span className="font-medium">Click to upload</span> or drag and drop
                            </>
                        )}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Supported: PDF, Images, Word, Excel, PowerPoint, CSV, TXT, JSON, XML, ZIP
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Max 50 files · Max 500MB per file
                    </p>
                </div>

                {/* Current Case Selection */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign to Case *
                    </label>
                    <select
                        value={currentCase}
                        onChange={(e) => setCurrentCase(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Case</option>
                        {/* Cases will be populated from API */}
                        <option value="1">CASE-2026-001 - Financial Fraud Investigation</option>
                        <option value="2">CASE-2026-002 - Cyber Security Breach</option>
                    </select>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                            Files ({files.length})
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setFiles([])}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {files.map((fileItem, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg transition-colors ${
                                    fileItem.status === 'uploaded' ? 'border-green-200 bg-green-50' :
                                    fileItem.status === 'failed' ? 'border-red-200 bg-red-50' :
                                    'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                {/* File Header */}
                                <div className="flex items-center p-3">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {getFileIcon(fileItem.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {fileItem.name}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                                <span>{formatFileSize(fileItem.size)}</span>
                                                <span>•</span>
                                                <span className={getStatusBadge(fileItem.status)}>
                                                    {fileItem.status.charAt(0).toUpperCase() + fileItem.status.slice(1)}
                                                </span>
                                                {fileItem.progress > 0 && fileItem.progress < 100 && (
                                                    <span className="text-blue-600">{fileItem.progress}%</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {fileItem.status === 'pending' && !uploading && (
                                            <>
                                                <button
                                                    onClick={() => toggleExpand(index)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                                >
                                                    {expandedFiles.has(index) ? 
                                                        <ChevronUp className="w-4 h-4" /> : 
                                                        <ChevronDown className="w-4 h-4" />
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {fileItem.status === 'uploaded' && (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        )}
                                        {fileItem.status === 'failed' && (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Metadata */}
                                {expandedFiles.has(index) && fileItem.status === 'pending' && (
                                    <div className="p-3 pt-0 border-t border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">
                                                    Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fileItem.metadata.title}
                                                    onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                                                    className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">
                                                    Collected Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={fileItem.metadata.collected_date}
                                                    onChange={(e) => updateFileMetadata(index, 'collected_date', e.target.value)}
                                                    className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={fileItem.metadata.description}
                                                    onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                                                    rows="2"
                                                    className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter description (optional)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress */}
            {uploading && (
                <div className="govt-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading files...
                        </span>
                        <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {files.filter(f => f.status === 'uploaded').length} of {files.length} uploaded
                    </p>
                </div>
            )}

            {/* Actions */}
            {files.length > 0 && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || files.some(f => f.status === 'uploaded')}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mr-2" />
                                Upload All ({files.filter(f => f.status === 'pending').length} pending)
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/evidence')}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default BulkUpload;