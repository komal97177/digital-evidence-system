// Location: /frontend/src/components/notifications/NotificationPreferences.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft,
    Bell, 
    Mail, 
    Smartphone,
    Shield,
    FileText,
    FolderCase,
    Activity,
    Save,
    RefreshCw,
    Check,
    X,
    AlertCircle,
    Info,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Trash2,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    Settings,
    BellOff,
    BellRing,
    User,
    Users,
    Building2,
    Globe,
    Volume2,
    VolumeX
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const NotificationPreferences = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        channels: {
            email: {
                enabled: true,
                frequency: 'realtime'
            },
            push: {
                enabled: true,
                sound: true,
                browser: true
            },
            sms: {
                enabled: false,
                phoneNumber: ''
            },
            inApp: {
                enabled: true,
                showPopup: true
            }
        },
        categories: {
            evidence: {
                created: true,
                updated: true,
                deleted: false,
                verified: true,
                transferred: true
            },
            case: {
                created: true,
                updated: true,
                closed: true,
                assigned: true
            },
            custody: {
                transfer: true,
                verification: true,
                alert: true,
                request: true
            },
            system: {
                maintenance: true,
                update: true,
                error: true,
                backup: true
            },
            security: {
                login: true,
                logout: false,
                failedAttempt: true,
                permissionChange: true
            },
            user: {
                mention: true,
                message: true,
                assignment: true,
                reminder: true
            }
        },
        schedule: {
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '06:00'
            },
            digest: {
                enabled: false,
                frequency: 'daily',
                time: '09:00'
            },
            emailSummary: {
                enabled: true,
                frequency: 'weekly'
            }
        },
        privacy: {
            showSender: true,
            showDetails: true,
            showTimestamp: true
        }
    });

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await api.get('/notifications/preferences');
            setPreferences(response.data);
        } catch (error) {
            toast.error('Failed to load preferences');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/notifications/preferences', preferences);
            toast.success('Preferences saved successfully');
        } catch (error) {
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset all notification preferences to default?')) return;
        
        try {
            await api.post('/notifications/preferences/reset');
            await fetchPreferences();
            toast.success('Preferences reset to default');
        } catch (error) {
            toast.error('Failed to reset preferences');
        }
    };

    const toggleChannel = (channel, enabled) => {
        setPreferences(prev => ({
            ...prev,
            channels: {
                ...prev.channels,
                [channel]: {
                    ...prev.channels[channel],
                    enabled
                }
            }
        }));
    };

    const toggleCategory = (category, setting) => {
        setPreferences(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: {
                    ...prev.categories[category],
                    [setting]: !prev.categories[category][setting]
                }
            }
        }));
    };

    const updateChannelSetting = (channel, key, value) => {
        setPreferences(prev => ({
            ...prev,
            channels: {
                ...prev.channels,
                [channel]: {
                    ...prev.channels[channel],
                    [key]: value
                }
            }
        }));
    };

    const updateSchedule = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [key]: value
            }
        }));
    };

    const updateScheduleNested = (parent, key, value) => {
        setPreferences(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [parent]: {
                    ...prev.schedule[parent],
                    [key]: value
                }
            }
        }));
    };

    const updatePrivacy = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [key]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="govt-loader mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Settings className="w-6 h-6 mr-2 text-blue-600" />
                            Notification Preferences
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Customize how and when you receive notifications
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
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
                                Save Preferences
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Channel Settings */}
            <div className="govt-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                    Notification Channels
                </h3>
                <div className="space-y-4">
                    {/* Email */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900">Email</p>
                                <p className="text-sm text-gray-500">Receive notifications via email</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 md:mt-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.channels.email.enabled}
                                    onChange={(e) => toggleChannel('email', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <select
                                value={preferences.channels.email.frequency}
                                onChange={(e) => updateChannelSetting('email', 'frequency', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={!preferences.channels.email.enabled}
                            >
                                <option value="realtime">Real-time</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                    </div>

                    {/* Push */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Smartphone className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-500">Browser and mobile push notifications</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.channels.push.enabled}
                                    onChange={(e) => toggleChannel('push', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            {preferences.channels.push.enabled && (
                                <>
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={preferences.channels.push.sound}
                                            onChange={(e) => updateChannelSetting('push', 'sound', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Sound</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={preferences.channels.push.browser}
                                            onChange={(e) => updateChannelSetting('push', 'browser', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Browser</span>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* SMS */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-gray-900">SMS</p>
                                <p className="text-sm text-gray-500">Critical alerts via SMS</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.channels.sms.enabled}
                                    onChange={(e) => toggleChannel('sms', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            {preferences.channels.sms.enabled && (
                                <input
                                    type="tel"
                                    value={preferences.channels.sms.phoneNumber}
                                    onChange={(e) => updateChannelSetting('sms', 'phoneNumber', e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Settings */}
            <div className="govt-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Notification Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Evidence */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <FileText className="w-4 h-4 mr-2 text-purple-600" />
                            Evidence
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(preferences.categories.evidence).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => toggleCategory('evidence', key)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Case */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <FolderCase className="w-4 h-4 mr-2 text-blue-600" />
                            Cases
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(preferences.categories.case).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => toggleCategory('case', key)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Custody */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                            Custody
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(preferences.categories.custody).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => toggleCategory('custody', key)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* System */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <Activity className="w-4 h-4 mr-2 text-gray-600" />
                            System
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(preferences.categories.system).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => toggleCategory('system', key)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <Shield className="w-4 h-4 mr-2 text-red-600" />
                            Security
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(preferences.categories.security).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => toggleCategory('security', key)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* User */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <User className="w-4 h-4 mr-2 text-green-600" />
                            User Interactions
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(preferences.categories.user).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => toggleCategory('user', key)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Settings */}
            <div className="govt-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Schedule & Digest
                </h3>
                <div className="space-y-4">
                    {/* Quiet Hours */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Quiet Hours</p>
                            <p className="text-sm text-gray-500">Mute notifications during specific hours</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.schedule.quietHours.enabled}
                                    onChange={(e) => updateScheduleNested('quietHours', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            {preferences.schedule.quietHours.enabled && (
                                <>
                                    <input
                                        type="time"
                                        value={preferences.schedule.quietHours.start}
                                        onChange={(e) => updateScheduleNested('quietHours', 'start', e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="time"
                                        value={preferences.schedule.quietHours.end}
                                        onChange={(e) => updateScheduleNested('quietHours', 'end', e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Digest */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Daily/Weekly Digest</p>
                            <p className="text-sm text-gray-500">Receive a summary of notifications</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.schedule.digest.enabled}
                                    onChange={(e) => updateScheduleNested('digest', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            {preferences.schedule.digest.enabled && (
                                <>
                                    <select
                                        value={preferences.schedule.digest.frequency}
                                        onChange={(e) => updateScheduleNested('digest', 'frequency', e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                    <input
                                        type="time"
                                        value={preferences.schedule.digest.time}
                                        onChange={(e) => updateScheduleNested('digest', 'time', e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Email Summary */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Email Summary</p>
                            <p className="text-sm text-gray-500">Receive periodic email summaries</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.schedule.emailSummary.enabled}
                                    onChange={(e) => updateSchedule('emailSummary', {...preferences.schedule.emailSummary, enabled: e.target.checked})}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            {preferences.schedule.emailSummary.enabled && (
                                <select
                                    value={preferences.schedule.emailSummary.frequency}
                                    onChange={(e) => updateSchedule('emailSummary', {...preferences.schedule.emailSummary, frequency: e.target.value})}
                                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="govt-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Privacy & Display
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Show sender information</span>
                        <input
                            type="checkbox"
                            checked={preferences.privacy.showSender}
                            onChange={(e) => updatePrivacy('showSender', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Show notification details</span>
                        <input
                            type="checkbox"
                            checked={preferences.privacy.showDetails}
                            onChange={(e) => updatePrivacy('showDetails', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Show timestamp</span>
                        <input
                            type="checkbox"
                            checked={preferences.privacy.showTimestamp}
                            onChange={(e) => updatePrivacy('showTimestamp', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button Footer */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <div className="govt-loader w-5 h-5 mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save All Preferences
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NotificationPreferences;