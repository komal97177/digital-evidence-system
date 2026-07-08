// Location: /frontend/src/components/common/ProfileDropdown.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Shield, UserCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const ProfileDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            investigator: 'bg-blue-100 text-blue-800',
            custodian: 'bg-green-100 text-green-800',
            analyzer: 'bg-purple-100 text-purple-800',
            viewer: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {getInitials(user?.full_name || user?.username)}
                </div>
                <span className="text-white text-sm hidden md:block">
                    {user?.full_name || user?.username}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">
                            {user?.full_name || user?.username}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className={`inline-block px-2 py-1 mt-2 rounded-full text-xs font-medium ${getRoleBadge(user?.role)}`}>
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                        </span>
                    </div>

                    <div className="py-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/profile');
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <UserCircle className="w-4 h-4 mr-3" />
                            My Profile
                        </button>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/admin/settings');
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Settings className="w-4 h-4 mr-3" />
                                Settings
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/admin/audit-logs');
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Shield className="w-4 h-4 mr-3" />
                            Security
                        </button>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;