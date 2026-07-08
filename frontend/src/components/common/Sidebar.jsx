// Location: /frontend/src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FolderCase, 
    FileText, 
    Shield, 
    Activity,
    Settings,
    LogOut,
    ClipboardList,
    Upload,
    Search,
    BarChart
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, user }) => {
    const navigate = useNavigate();
    const { logout } = React.useContext(AuthContext);

    const menuItems = {
        admin: [
            { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/admin/users', icon: Users, label: 'User Management' },
            { path: '/admin/audit-logs', icon: Activity, label: 'Audit Logs' },
            { path: '/admin/settings', icon: Settings, label: 'System Settings' },
            { path: '/admin/backup', icon: Shield, label: 'Backup & Restore' }
        ],
        investigator: [
            { path: '/investigator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/evidence', icon: FolderCase, label: 'Evidence' },
            { path: '/evidence/upload', icon: Upload, label: 'Upload Evidence' },
            { path: '/evidence/search', icon: Search, label: 'Search' }
        ],
        custodian: [
            { path: '/custodian/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/evidence', icon: FolderCase, label: 'Evidence' },
            { path: '/custody/transfer', icon: ClipboardList, label: 'Transfer Custody' },
            { path: '/custody/verify', icon: Shield, label: 'Verify Integrity' }
        ],
        analyzer: [
            { path: '/analyzer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/evidence', icon: FolderCase, label: 'Evidence' },
            { path: '/analyzer/analytics', icon: BarChart, label: 'Analytics' }
        ],
        viewer: [
            { path: '/viewer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/evidence', icon: FolderCase, label: 'Evidence' }
        ]
    };

    const items = menuItems[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`
            fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20
            ${isOpen ? 'w-64' : 'w-20'}
            pt-20
        `}>
            <nav className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    {items.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center px-4 py-3 mx-2 rounded-lg transition-colors
                                ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
                                ${!isOpen && 'justify-center'}
                            `}
                            title={!isOpen ? item.label : ''}
                        >
                            <item.icon className={`w-5 h-5 ${!isOpen ? '' : 'mr-3'}`} />
                            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                        </NavLink>
                    ))}
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 p-4">
                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors
                            ${!isOpen && 'justify-center'}
                        `}
                        title={!isOpen ? 'Logout' : ''}
                    >
                        <LogOut className="w-5 h-5" />
                        {isOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;