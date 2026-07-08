// Location: /frontend/src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                        <span>© {currentYear} Ministry of Home Affairs</span>
                        <span className="hidden md:inline">|</span>
                        <span>Digital Evidence Management System</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                        <span className="text-xs text-gray-400">Version 1.0.0</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-green-600 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            System Online
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;