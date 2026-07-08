// Location: /frontend/src/components/common/Header.jsx
import React, { useContext } from 'react';
import { Menu, Home, Users, FolderCase, FileText, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';
import SearchBar from './SearchBar';
import emblem from '../../assets/images/emblem.png';

const Header = ({ onMenuClick }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="govt-header sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="text-white hover:text-gold-300 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <img src={emblem} alt="Emblem" className="h-10 w-10" />
                        <div>
                            <h1 className="text-white font-bold text-lg">
                                Digital Evidence Management
                            </h1>
                            <p className="text-blue-200 text-xs">
                                Ministry of Home Affairs
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <SearchBar />
                    <NotificationBell />
                    <ProfileDropdown user={user} />
                </div>
            </div>
        </header>
    );
};

export default Header;