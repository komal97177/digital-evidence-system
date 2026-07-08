// Location: /frontend/src/components/custody/CustodyTimeline.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Clock, 
    User, 
    FileText, 
    CheckCircle, 
    AlertCircle,
    Activity,
    Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CustodyTimeline = () => {
    const { evidenceId } = useParams();
    const navigate = useNavigate();
    const [timeline, setTimeline] = useState([]);
    const [evidence, setEvidence] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTimeline();
    }, [evidenceId]);

    const fetchTimeline = async () => {
        try {
            const response = await api.get(`/custody/timeline/${evidenceId}`);
            setTimeline(response.data.timeline);
            
            // Get evidence details
            const evRes = await api.get(`/evidence/${evidenceId}`);
            setEvidence(evRes.data.evidence);
        } catch (error) {
            toast.error('Failed to fetch custody timeline');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            registered: <FileText className="w-5 h-5" />,
            uploaded: <Activity className="w-5 h-5" />,
            stored: <CheckCircle className="w-5 h-5" />,
            transferred: <User className="w-5 h-5" />,
            viewed: <Eye className="w-5 h-5" />,
            analyzed: <Activity className="w-5 h-5" />,
            verified: <Shield className="w-5 h-5" />,
            archived: <Archive className="w-5 h-5" />
        };
        return icons[action] || <Clock className="w-5 h-5" />;
    };

    const getActionColor = (action) => {
        const colors = {
            registered: 'text-blue-500',
            uploaded: 'text-green-500',
            stored: 'text-green-500',
            transferred: 'text-purple-500',
            viewed: 'text-gray-500',
            analyzed: 'text-orange-500',
            verified: 'text-indigo-500',
            archived: 'text-gray-500'
        };
        return colors[action] || 'text-gray-500';
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="govt-loader"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => navigate('/evidence')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Custody Timeline</h1>
                    <p className="text-sm text-gray-600">
                        {evidence?.evidence_id} - {evidence?.title}
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div className="govt-card p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Total Events</p>
                        <p className="text-2xl font-bold text-gray-900">{timeline.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">First Recorded</p>
                        <p className="text-sm text-gray-900">
                            {timeline.length > 0 ? new Date(timeline[0].created_at).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-sm text-gray-900">
                            {timeline.length > 0 ? new Date(timeline[timeline.length - 1].created_at).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            timeline.some(t => t.hash_before !== t.hash_after) 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                        }`}>
                            {timeline.some(t => t.hash_before !== t.hash_after) ? '⚠️ Integrity Alert' : '✅ Verified'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {timeline.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No custody events recorded
                    </div>
                ) : (
                    timeline.map((event, index) => (
                        <div key={event.id} className="relative pl-14 pb-8 last:pb-0">
                            {/* Timeline Dot */}
                            <div className={`absolute left-4 w-5 h-5 rounded-full border-4 border-white ${getActionColor(event.action)} bg-${getActionColor(event.action).replace('text-', '')}`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {getActionIcon(event.action)}
                                </div>
                            </div>

                            {/* Event Card */}
                            <div className="govt-card p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(event.action)}`}>
                                            {event.action.toUpperCase()}
                                        </span>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {event.notes || 'No additional notes'}
                                        </p>
                                        {event.from_user_id && event.to_user_id && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                <User className="w-3 h-3 inline mr-1" />
                                                {event.from_username} → {event.to_username}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right mt-2 md:mt-0">
                                        <p className="text-sm text-gray-600">
                                            {new Date(event.created_at).toLocaleString()}
                                        </p>
                                        {event.hash_before && event.hash_after && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                <Shield className="w-3 h-3 inline mr-1" />
                                                {event.hash_before === event.hash_after ? '✅ Verified' : '⚠️ Changed'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Hash Details */}
                                {event.hash_before && event.hash_after && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <p className="text-gray-500">Hash Before</p>
                                                <p className="font-mono truncate">{event.hash_before}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Hash After</p>
                                                <p className="font-mono truncate">{event.hash_after}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CustodyTimeline;