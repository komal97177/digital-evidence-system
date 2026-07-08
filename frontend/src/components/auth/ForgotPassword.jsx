// Location: /frontend/src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import emblem from '../../assets/images/emblem.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
            setResendTimer(60);
            toast.success('Password reset link sent to your email');
            
            // Start resend timer
            const timer = setInterval(() => {
                setResendTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset link');
            toast.error(err.response?.data?.error || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (resendTimer === 0) {
            handleSubmit(new Event('submit'));
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a password reset link to <br />
                        <strong className="text-blue-600">{email}</strong>
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
                        <p>📧 Didn't receive the email?</p>
                        <ul className="list-disc list-inside mt-2 text-left text-blue-600">
                            <li>Check your spam folder</li>
                            <li>Wait a few minutes and try again</li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleResend}
                            disabled={resendTimer > 0}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Email'}
                        </button>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <img src={emblem} alt="Emblem" className="h-20 w-20 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-600 mt-2">
                        Enter your registered email to receive a password reset link
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 border ${
                                        error ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                    placeholder="Enter your registered email"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                We'll send a password reset link to this email
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Back to Login
                            </Link>
                        </div>

                        <div className="text-center text-xs text-gray-400">
                            <p>For assistance, contact system administrator</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;