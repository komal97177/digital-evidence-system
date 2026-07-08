// Location: /frontend/src/components/common/MainLayout.jsx
import React, { useState, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useContext(AuthContext);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} user={user} />
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="p-6">
                        <Breadcrumb location={location} />
                        <Outlet />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;