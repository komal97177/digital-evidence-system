// Location: /frontend/src/components/evidence/EvidenceUpload.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EvidenceUpload = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        case_id: '',
        title: '',
        description: '',
        collected_date: new Date().toISOString().split('T')[0],
        storage_location: ''
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await api.get('/cases');
            setCases(response.data.cases);
        } catch (error) {
            toast.error('Failed to fetch cases');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setFiles(prev => [...prev, ...acceptedFiles]);
        },
        maxSize: 500 * 1024 * 1024, // 500MB
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'text/csv': ['.csv'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        }
    });

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.case_id || !formData.title || files.length === 0) {
            toast.error('Please fill all required fields and upload at least one file');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            // First register evidence
            const evidenceData = {
                ...formData,
                collected_by: 1 // Will be replaced by backend from token
            };
            
            const evidenceResponse = await api.post('/evidence/register', evidenceData);
            const evidenceId = evidenceResponse.data.evidence.id;

            // Upload files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('evidence_id', evidenceId);
                formData.append('file', file);

                await api.post('/evidence/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            ((i + progressEvent.loaded / progressEvent.total) / files.length) * 100
                        );
                        setUploadProgress(percentCompleted);
                    }
                });
            }

            toast.success('Evidence uploaded successfully!');
            navigate('/evidence');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upload Evidence</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Register new evidence and upload files securely
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Evidence Details */}
                <div className="govt-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Evidence Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Case *
                            </label>
                            <select
                                value={formData.case_id}
                                onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Case</option>
                                {cases.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.case_number} - {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Collected Date
                            </label>
                            <input
                                type="date"
                                value={formData.collected_date}
                                onChange={(e) => setFormData({...formData, collected_date: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Storage Location
                            </label>
                            <input
                                type="text"
                                value={formData.storage_location}
                                onChange={(e) => setFormData({...formData, storage_location: e.target.value})}
                                placeholder="e.g., Evidence Room A-12"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* File Upload */}
                <div className="govt-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Upload Files *
                    </h3>
                    
                    <div
                        {...getRootProps()}
                        className={`
                            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                        `}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">
                            {isDragActive ? (
                                'Drop files here...'
                            ) : (
                                <>
                                    <span className="font-medium">Click to upload</span> or drag and drop
                                </>
                            )}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Supported: PDF, Images, Word, Excel, CSV, TXT (Max 500MB)
                        </p>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <File className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Progress */}
                {loading && (
                    <div className="govt-card p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Uploading...</span>
                            <span className="text-sm text-gray-500">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload Evidence'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/evidence')}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EvidenceUpload;