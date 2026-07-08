// Location: /frontend/src/components/admin/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
    Settings, 
    Shield, 
    Database, 
    Bell, 
    Lock, 
    Save, 
    RefreshCw,
    Globe,
    Server,
    Mail,
    Smartphone,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        security: {
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordPolicy: 'strong',
            twoFactorAuth: false,
            requireMFA: false,
            sessionLifetime: 24
        },
        storage: {
            maxFileSize: 500,
            allowedFileTypes: ['pdf', 'jpg', 'png', 'docx', 'xlsx', 'csv', 'txt'],
            retentionPeriod: 365,
            backupFrequency: 'daily',
            encryptionEnabled: true
        },
        notifications: {
            emailEnabled: true,
            emailOnTransfer: true,
            emailOnIntegrity: true,
            emailOnLogin: false,
            smsEnabled: false,
            pushEnabled: true
        },
        system: {
            maintenanceMode: false,
            debugMode: false,
            logRetention: 90,
            autoBackup: true,
            timezone: 'Asia/Kolkata',
            language: 'en'
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('security');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            setSettings(response.data);
        } catch (error) {
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings', settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset all settings to default?')) return;
        try {
            await api.post('/admin/settings/reset');
            await fetchSettings();
            toast.success('Settings reset to default');
        } catch (error) {
            toast.error('Failed to reset settings');
        }
    };

    const testConnection = async () => {
        try {
            await api.get('/health');
            toast.success('System connection successful!');
        } catch (error) {
            toast.error('Connection test failed');
        }
    };

    const SettingRow = ({ label, description, children }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div className="mb-2 md:mb-0 md:mr-4 flex-1">
                <p className="font-medium text-gray-700">{label}</p>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <div className="md:flex-shrink-0">
                {children}
            </div>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, description }) => (
        <div className="mb-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'storage', label: 'Storage', icon: Database },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'system', label: 'System', icon: Settings }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="govt-loader mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Settings className="w-6 h-6 mr-2 text-blue-600" />
                        System Settings
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure system parameters, security policies, and preferences
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={testConnection}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Server className="w-4 h-4 mr-2" />
                        Test Connection
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="govt-loader w-4 h-4 mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <tab.icon className="w-4 h-4 inline mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="govt-card p-6">
                {activeTab === 'security' && (
                    <div>
                        <SectionHeader 
                            icon={Shield} 
                            title="Security Settings" 
                            description="Configure authentication and security policies"
                        />
                        <SettingRow 
                            label="Session Timeout" 
                            description="Minutes of inactivity before automatic logout"
                        >
                            <input
                                type="number"
                                value={settings.security.sessionTimeout}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    security: {
                                        ...settings.security,
                                        sessionTimeout: parseInt(e.target.value)
                                    }
                                })}
                                className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="5"
                                max="120"
                            />
                            <span className="ml-2 text-sm text-gray-500">minutes</span>
                        </SettingRow>

                        <SettingRow 
                            label="Max Login Attempts" 
                            description="Failed login attempts before account lockout"
                        >
                            <input
                                type="number"
                                value={settings.security.maxLoginAttempts}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    security: {
                                        ...settings.security,
                                        maxLoginAttempts: parseInt(e.target.value)
                                    }
                                })}
                                className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="3"
                                max="10"
                            />
                        </SettingRow>

                        <SettingRow 
                            label="Two-Factor Authentication" 
                            description="Require 2FA for all users"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.security.twoFactorAuth}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        security: {
                                            ...settings.security,
                                            twoFactorAuth: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Session Lifetime" 
                            description="Maximum session duration in hours"
                        >
                            <input
                                type="number"
                                value={settings.security.sessionLifetime}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    security: {
                                        ...settings.security,
                                        sessionLifetime: parseInt(e.target.value)
                                    }
                                })}
                                className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="1"
                                max="72"
                            />
                            <span className="ml-2 text-sm text-gray-500">hours</span>
                        </SettingRow>
                    </div>
                )}

                {activeTab === 'storage' && (
                    <div>
                        <SectionHeader 
                            icon={Database} 
                            title="Storage Settings" 
                            description="Configure file storage and retention policies"
                        />
                        <SettingRow 
                            label="Max File Size" 
                            description="Maximum file size in MB"
                        >
                            <input
                                type="number"
                                value={settings.storage.maxFileSize}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    storage: {
                                        ...settings.storage,
                                        maxFileSize: parseInt(e.target.value)
                                    }
                                })}
                                className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="10"
                                max="1000"
                            />
                            <span className="ml-2 text-sm text-gray-500">MB</span>
                        </SettingRow>

                        <SettingRow 
                            label="Retention Period" 
                            description="Days to keep evidence before archival"
                        >
                            <input
                                type="number"
                                value={settings.storage.retentionPeriod}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    storage: {
                                        ...settings.storage,
                                        retentionPeriod: parseInt(e.target.value)
                                    }
                                })}
                                className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="30"
                                max="730"
                            />
                            <span className="ml-2 text-sm text-gray-500">days</span>
                        </SettingRow>

                        <SettingRow 
                            label="Encryption" 
                            description="Enable file encryption at rest"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.storage.encryptionEnabled}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        storage: {
                                            ...settings.storage,
                                            encryptionEnabled: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Backup Frequency" 
                            description="How often to backup evidence"
                        >
                            <select
                                value={settings.storage.backupFrequency}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    storage: {
                                        ...settings.storage,
                                        backupFrequency: e.target.value
                                    }
                                })}
                                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </SettingRow>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div>
                        <SectionHeader 
                            icon={Bell} 
                            title="Notification Settings" 
                            description="Configure notification channels and triggers"
                        />
                        <SettingRow 
                            label="Email Notifications" 
                            description="Enable email notifications"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.emailEnabled}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            emailEnabled: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Custody Transfer Notifications" 
                            description="Notify on evidence custody transfer"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.emailOnTransfer}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            emailOnTransfer: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Integrity Alert Notifications" 
                            description="Notify on integrity verification failures"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.emailOnIntegrity}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            emailOnIntegrity: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="SMS Notifications" 
                            description="Enable SMS notifications"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.smsEnabled}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            smsEnabled: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Push Notifications" 
                            description="Enable browser push notifications"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.pushEnabled}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            pushEnabled: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div>
                        <SectionHeader 
                            icon={Settings} 
                            title="System Settings" 
                            description="Configure system-wide parameters"
                        />
                        <SettingRow 
                            label="Maintenance Mode" 
                            description="Put system in maintenance mode (users cannot log in)"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system.maintenanceMode}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: {
                                            ...settings.system,
                                            maintenanceMode: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Log Retention" 
                            description="Days to keep audit logs"
                        >
                            <input
                                type="number"
                                value={settings.system.logRetention}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    system: {
                                        ...settings.system,
                                        logRetention: parseInt(e.target.value)
                                    }
                                })}
                                className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="30"
                                max="365"
                            />
                            <span className="ml-2 text-sm text-gray-500">days</span>
                        </SettingRow>

                        <SettingRow 
                            label="Auto Backup" 
                            description="Enable automatic system backups"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system.autoBackup}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: {
                                            ...settings.system,
                                            autoBackup: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Debug Mode" 
                            description="Enable debug logging (development only)"
                        >
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system.debugMode}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: {
                                            ...settings.system,
                                            debugMode: e.target.checked
                                        }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </SettingRow>

                        <SettingRow 
                            label="Timezone" 
                            description="System timezone"
                        >
                            <select
                                value={settings.system.timezone}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    system: {
                                        ...settings.system,
                                        timezone: e.target.value
                                    }
                                })}
                                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="Europe/London">Europe/London</option>
                                <option value="Australia/Sydney">Australia/Sydney</option>
                            </select>
                        </SettingRow>

                        <SettingRow 
                            label="Language" 
                            description="System language"
                        >
                            <select
                                value={settings.system.language}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    system: {
                                        ...settings.system,
                                        language: e.target.value
                                    }
                                })}
                                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                            </select>
                        </SettingRow>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemSettings;