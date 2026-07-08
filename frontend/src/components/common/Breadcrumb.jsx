// Location: /frontend/src/components/common/Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ location }) => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    const getLabel = (path) => {
        const labels = {
            'admin': 'Admin',
            'dashboard': 'Dashboard',
            'users': 'Users',
            'evidence': 'Evidence',
            'upload': 'Upload',
            'custody': 'Custody',
            'transfer': 'Transfer',
            'verify': 'Verify',
            'reports': 'Reports',
            'settings': 'Settings',
            'audit-logs': 'Audit Logs',
            'backup': 'Backup & Restore'
        };
        return labels[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    return (
        <nav className="flex items-center space-x-2 text-sm mb-6">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                <Home className="w-4 h-4" />
            </Link>
            {paths.map((path, index) => {
                const isLast = index === paths.length - 1;
                const to = '/' + paths.slice(0, index + 1).join('/');
                
                return (
                    <React.Fragment key={to}>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        {isLast ? (
                            <span className="text-gray-900 font-medium">
                                {getLabel(path)}
                            </span>
                        ) : (
                            <Link to={to} className="text-gray-500 hover:text-gray-700">
                                {getLabel(path)}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;