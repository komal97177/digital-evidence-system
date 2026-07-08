// Location: /frontend/src/components/custody/TransferCustody.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Calendar, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const TransferCustody = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        evidence_id: '',
        to_user_id: '',
        notes: '',
        transfer_date: new Date().toISOString().split('T')[0]
    });
    const [selectedEvidence, setSelectedEvidence] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, evidenceRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/evidence')
            ]);
            setUsers(usersRes.data.users);
            setEvidence(evidenceRes.data.evidence);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleEvidenceChange = (e) => {
        const id = parseInt(e.target.value);
        const ev = evidence.find(item => item.id === id);
        setSelectedEvidence(ev);
        setFormData({...formData, evidence_id: id});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.evidence_id || !formData.to_user_id) {
            toast.error('Please select evidence and recipient');
            return;
        }

        try {
            await api.post('/custody/transfer', formData);
            toast.success('Custody transferred successfully');
            navigate(`/custody/timeline/${formData.evidence_id}`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Transfer failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="govt-loader"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Transfer Custody</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Transfer evidence custody to another authorized user
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Evidence Selection */}
                <div className="govt-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Select Evidence
                    </h3>
                    <select
                        value={formData.evidence_id}
                        onChange={handleEvidenceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Evidence</option>
                        {evidence.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.evidence_id} - {item.title}
                            </option>
                        ))}
                    </select>

                    {selectedEvidence && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {selectedEvidence.title}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        ID: {selectedEvidence.evidence_id}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Status: {selectedEvidence.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recipient Selection */}
                <div className="govt-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Transfer To
                    </h3>
                    <select
                        value={formData.to_user_id}
                        onChange={(e) => setFormData({...formData, to_user_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Recipient</option>
                        {users.filter(u => u.is_active).map(user => (
                            <option key={user.id} value={user.id}>
                                {user.full_name || user.username} - {user.role}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Transfer Details */}
                <div className="govt-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Transfer Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transfer Date
                            </label>
                            <input
                                type="date"
                                value={formData.transfer_date}
                                onChange={(e) => setFormData({...formData, transfer_date: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transfer Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                rows="4"
                                placeholder="Reason for transfer, conditions, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-800">Important</p>
                            <p className="text-sm text-yellow-700">
                                Transferring custody creates a permanent record in the chain of custody.
                                Ensure you have the authority to transfer this evidence.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Transfer Custody
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

export default TransferCustody;