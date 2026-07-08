// Location: /frontend/src/components/admin/BackupRestore.jsx
import React, { useState, useEffect } from 'react';
import { 
    Database, 
    Download, 
    Upload, 
    RefreshCw,
    Clock,
    FileArchive,
    AlertTriangle,
    CheckCircle,
    XCircle,
    HardDrive,
    Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const BackupRestore = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [storageInfo, setStorageInfo] = useState({
        total: 0,
        used: 0,
        free: 0
    });

    useEffect(() => {
        fetchBackups();
        fetchStorageInfo();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/backups');
            setBackups(response.data);
        } catch (error) {
            toast.error('Failed to fetch backups');
        } finally {
            setLoading(false);
        }
    };

    const fetchStorageInfo = async () => {
        try {
            const response = await api.get('/admin/storage-info');
            setStorageInfo(response.data);
        } catch (error) {
            console.error('Failed to fetch storage info');
        }
    };

    const createBackup = async () => {
        if (!window.confirm('Create a full system backup? This may take a few minutes.')) return;
        
        setCreatingBackup(true);
        try {
            const response = await api.post('/admin/backup');
            toast.success('Backup created successfully');
            fetchBackups();
            fetchStorageInfo();
        } catch (error) {
            toast.error('Failed to create backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    const restoreBackup = async (backupId) => {
        if (!window.confirm('Restore from this backup? This will overwrite current data!')) return;
        
        setRestoring(true);
        try {
            await api.post(`/admin/restore/${backupId}`);
            toast.success('Backup restored successfully');
            fetchBackups();
        } catch (error) {
            toast.error('Failed to restore backup');
        } finally {
            setRestoring(false);
        }
    };

    const downloadBackup = async (backupId) => {
        try {
            const response = await api.get(`/admin/backup/download/${backupId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup-${backupId}.sql`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Download started');
        } catch (error) {
            toast.error('Failed to download backup');
        }
    };

    const deleteBackup = async (backupId) => {
        if (!window.confirm('Delete this backup?')) return;
        
        try {
            await api.delete(`/admin/backup/${backupId}`);
            toast.success('Backup deleted');
            fetchBackups();
            fetchStorageInfo();
        } catch (error) {
            toast.error('Failed to delete backup');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const getBackupStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            in_progress: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getBackupStatusIcon = (status) => {
        switch(status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'in_progress':
                return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
            default:
                return <FileArchive className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Database className="w-6 h-6 mr-2 text-blue-600" />
                        Backup & Restore
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage system backups and disaster recovery
                    </p>
                </div>
                <button
                    onClick={createBackup}
                    disabled={creatingBackup}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {creatingBackup ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Database className="w-4 h-4 mr-2" />
                            Create Backup
                        </>
                    )}
                </button>
            </div>

            {/* Storage Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="govt-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Storage</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatFileSize(storageInfo.total)}
                            </p>
                        </div>
                        <HardDrive className="w-8 h-8 text-blue-600 opacity-50" />
                    </div>
                </div>
                <div className="govt-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Used Storage</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatFileSize(storageInfo.used)}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                                {storageInfo.total ? Math.round((storageInfo.used / storageInfo.total) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${storageInfo.total ? (storageInfo.used / storageInfo.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
                <div className="govt-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Free Storage</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatFileSize(storageInfo.free)}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600">Free</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning */}
            {storageInfo.free < 1024 * 1024 * 1024 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800">Low Storage Space</p>
                        <p className="text-sm text-yellow-700">
                            Your system is running low on storage. Please free up space or increase storage capacity.
                        </p>
                    </div>
                </div>
            )}

            {/* Backups List */}
            <div className="govt-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Backup History
                </h3>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="govt-loader"></div>
                    </div>
                ) : backups.length === 0 ? (
                    <div className="text-center py-12">
                        <FileArchive className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No backups available</p>
                        <button
                            onClick={createBackup}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            Create your first backup
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {backups.map((backup) => (
                            <div
                                key={backup.id}
                                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border transition-colors ${
                                    selectedBackup === backup.id
                                        ? 'bg-blue-50 border-blue-300'
                                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => setSelectedBackup(backup.id)}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-white rounded-lg">
                                        {getBackupStatusIcon(backup.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <p className="font-medium text-gray-900">
                                                Backup #{backup.id}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBackupStatusColor(backup.status)}`}>
                                                {backup.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <span className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(backup.created_at).toLocaleString()}
                                            </span>
                                            <span className="flex items-center text-sm text-gray-500">
                                                <HardDrive className="w-3 h-3 mr-1" />
                                                {formatFileSize(backup.size)}
                                            </span>
                                            <span className="flex items-center text-sm text-gray-500">
                                                <FileArchive className="w-3 h-3 mr-1" />
                                                {backup.type || 'Full'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-3 md:mt-0">
                                    <button
                                        onClick={() => downloadBackup(backup.id)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => restoreBackup(backup.id)}
                                        disabled={restoring}
                                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Restore"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteBackup(backup.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manual Upload */}
            <div className="govt-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upload Backup File
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Drop backup file here or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Supported: .sql, .zip, .tar.gz</p>
                    <input
                        type="file"
                        accept=".sql,.zip,.tar.gz"
                        className="hidden"
                        onChange={(e) => {
                            // Handle file upload
                            toast.info('File upload coming soon');
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;