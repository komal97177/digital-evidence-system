// Location: /frontend/src/components/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import RobotVerification from './RobotVerification';
import emblem from '../../assets/images/emblem.png';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPuzzle, setShowPuzzle] = useState(false);
    const [isHuman, setIsHuman] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);

    // Check if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
            redirectBasedOnRole(user.role);
        }
    }, [isAuthenticated]);

    // Handle lock timer
    useEffect(() => {
        let interval;
        if (isLocked && lockTimer > 0) {
            interval = setInterval(() => {
                setLockTimer(prev => prev - 1);
            }, 1000);
        } else if (lockTimer === 0 && isLocked) {
            setIsLocked(false);
            setAttempts(0);
            toast.info('Account unlocked. Please try again.');
        }
        return () => clearInterval(interval);
    }, [isLocked, lockTimer]);

    const redirectBasedOnRole = (role) => {
        const routes = {
            admin: '/admin/dashboard',
            investigator: '/investigator/dashboard',
            custodian: '/custodian/dashboard',
            analyzer: '/analyzer/dashboard',
            viewer: '/viewer/dashboard'
        };
        navigate(routes[role] || '/dashboard');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLocked) {
            setError(`Account locked. Please wait ${lockTimer} seconds.`);
            return;
        }

        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }

        // Show puzzle first
        setShowPuzzle(true);
    };

    const handlePuzzleComplete = async (verified) => {
        setShowPuzzle(false);
        
        if (verified) {
            setIsHuman(true);
            await performLogin();
        } else {
            setAttempts(prev => prev + 1);
            if (attempts + 1 >= 3) {
                setIsLocked(true);
                setLockTimer(30);
                toast.error('Too many failed attempts. Account locked for 30 seconds.');
            } else {
                toast.error(`Verification failed. ${2 - attempts} attempts remaining.`);
                setError('Please complete the verification correctly.');
            }
        }
    };

    const performLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await login(formData);
            
            if (response.success) {
                toast.success('Welcome back! Login successful.');
                redirectBasedOnRole(response.user.role);
            } else {
                setError(response.error || 'Invalid credentials');
                setAttempts(prev => prev + 1);
                
                if (attempts + 1 >= 3) {
                    setIsLocked(true);
                    setLockTimer(30);
                    toast.error('Too many failed attempts. Account locked for 30 seconds.');
                }
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Government Emblem & Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-4 mb-4">
                        <img 
                            src={emblem} 
                            alt="Government of India Emblem" 
                            className="h-20 w-20 object-contain"
                        />
                        <div className="border-l-2 border-gray-300 h-16"></div>
                        <div className="text-left">
                            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Government of India
                            </h2>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                Digital Evidence<br />
                                Management System
                            </h1>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Ministry of Home Affairs · Cyber Security Division
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username / Employee ID
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                                        error ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors`}
                                    placeholder="Enter your username"
                                    disabled={isLocked}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-2.5 border ${
                                        error ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors`}
                                    placeholder="Enter your password"
                                    disabled={isLocked}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <div>
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Lock Timer */}
                        {isLocked && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                <span>Account locked. Please wait {lockTimer} seconds.</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || isLocked}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5 mr-2" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Secured by Government of India</span>
                            <span className="w-px h-4 bg-gray-300"></span>
                            <span>256-bit SSL Encryption</span>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Ministry of Home Affairs · All rights reserved
                    </p>
                    <p className="text-xs text-gray-400">
                        Version 1.0.0 · For official use only
                    </p>
                </div>
            </div>

            {/* Robot Verification Modal */}
            {showPuzzle && (
                <RobotVerification
                    onComplete={handlePuzzleComplete}
                    onClose={() => setShowPuzzle(false)}
                />
            )}
        </div>
    );
};

export default Login;