// Location: /frontend/src/components/common/SearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/evidence/search?q=${encodeURIComponent(query)}`);
            setIsOpen(false);
            setQuery('');
        }
    };

    return (
        <div className="relative">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-white hover:text-blue-200 transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search evidence..."
                        className="w-48 px-3 py-1 rounded-lg bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="ml-2 text-white hover:text-blue-200"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            setQuery('');
                        }}
                        className="ml-2 text-white hover:text-blue-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </form>
            )}
        </div>
    );
};

export default SearchBar;