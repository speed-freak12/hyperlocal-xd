// components/SearchComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Search, MapPin, Star, Users, Zap, X, Clock } from 'lucide-react';

export default function SearchComponent({
    placeholder = "Search for skills, teachers, or topics...",
    variant = "default", // 'default', 'compact', 'hero'
    onSearchSelect,
    showRecentSearches = true,
    className = ""
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const savedSearches = localStorage.getItem('hyperlocal_recent_searches');
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const saveToRecentSearches = (query) => {
        if (!query.trim()) return;

        const updatedSearches = [
            query,
            ...recentSearches.filter(search => search !== query)
        ].slice(0, 5); // Keep only 5 most recent

        setRecentSearches(updatedSearches);
        localStorage.setItem('hyperlocal_recent_searches', JSON.stringify(updatedSearches));
    };

    const searchUsers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const results = [];

            snapshot.forEach(doc => {
                const userData = doc.data();
                const searchableText = [
                    ...(userData.skills || []),
                    userData.bio || '',
                    userData.name || '',
                    userData.role || '',
                    userData.location || '',
                    userData.expertiseLevel || '',
                    ...(userData.languages || [])
                ].join(' ').toLowerCase();

                if (searchableText.includes(query.toLowerCase())) {
                    results.push({
                        id: doc.id,
                        ...userData,
                        relevance: calculateRelevance(userData, query)
                    });
                }
            });

            // Sort by relevance and limit results
            results.sort((a, b) => b.relevance - a.relevance);
            setSearchResults(results.slice(0, 8)); // Show top 8 results
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const calculateRelevance = (userData, query) => {
        let relevance = 0;
        const queryLower = query.toLowerCase();

        // Exact skill match (highest weight)
        if (userData.skills) {
            userData.skills.forEach(skill => {
                if (skill.toLowerCase() === queryLower) relevance += 5;
                else if (skill.toLowerCase().includes(queryLower)) relevance += 3;
            });
        }

        // Name match
        if (userData.name?.toLowerCase().includes(queryLower)) {
            relevance += 4;
        }

        // Location match
        if (userData.location?.toLowerCase().includes(queryLower)) {
            relevance += 3;
        }

        // Bio match
        if (userData.bio?.toLowerCase().includes(queryLower)) {
            relevance += 2;
        }

        // Role match
        if (userData.role?.toLowerCase().includes(queryLower)) {
            relevance += 2;
        }

        // Language match
        if (userData.languages) {
            userData.languages.forEach(language => {
                if (language.toLowerCase().includes(queryLower)) relevance += 2;
            });
        }

        return relevance;
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim()) {
            searchUsers(value);
            setShowDropdown(true);
        } else {
            setSearchResults([]);
            setShowDropdown(true);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            saveToRecentSearches(searchQuery.trim());

            if (onSearchSelect) {
                onSearchSelect(searchQuery.trim());
            } else {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }

            setShowDropdown(false);
        }
    };

    const handleQuickSearch = (query) => {
        setSearchQuery(query);
        saveToRecentSearches(query);

        if (onSearchSelect) {
            onSearchSelect(query);
        } else {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }

        setShowDropdown(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(true);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('hyperlocal_recent_searches');
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'compact':
                return {
                    container: 'w-full',
                    input: 'pl-10 pr-10 py-2 text-sm rounded-lg',
                    button: 'right-2 px-3 py-1 text-sm'
                };
            case 'hero':
                return {
                    container: 'w-full max-w-3xl',
                    input: 'pl-12 pr-32 py-4 text-lg rounded-2xl',
                    button: 'right-2 px-6 py-2 text-base'
                };
            default:
                return {
                    container: 'w-full max-w-2xl',
                    input: 'pl-10 pr-10 py-3 text-base rounded-xl',
                    button: 'right-2 px-4 py-2 text-sm'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div ref={searchRef} className={`relative ${styles.container} ${className}`}>
            <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder={placeholder}
                        className={`w-full border border-gray-300 outline-none  shadow-sm ${styles.input}`}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {/* <button
                        type="submit"
                        className={`absolute top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black font-medium hover:bg-yellow-500 transition-colors rounded-lg ${styles.button}`}
                    >
                        Search
                    </button> */}
                </div>
            </form>

            {/* Search Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                    {/* Recent Searches */}
                    {showRecentSearches && recentSearches.length > 0 && !searchQuery && (
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Recent Searches
                                </h3>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="space-y-2">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickSearch(search)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                                    >
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700">{search}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {searchQuery && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
                            </h3>

                            {isSearching ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-3">
                                    {searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => navigate(`/profile/${user.id}`)}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">{user.name}</h4>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="truncate">{user.location || 'Location not set'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {user.role && (
                                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                                        <Users className="w-3 h-3" />
                                                        {user.role}
                                                    </span>
                                                )}
                                                {user.skills?.slice(0, 2).map((skill, index) => (
                                                    <span key={index} className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs">
                                                        <Zap className="w-3 h-3" />
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {user.bio && (
                                                <p className="text-sm text-gray-600 line-clamp-2 text-left">
                                                    {user.bio}
                                                </p>
                                            )}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handleQuickSearch(searchQuery)}
                                        className="w-full text-center p-3 text-yellow-600 hover:bg-yellow-50 rounded-lg border border-yellow-200 font-medium"
                                    >
                                        View all results for "{searchQuery}"
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                                    <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Popular Skills Suggestions */}
                    {!searchQuery && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                Popular Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['Guitar', 'Cooking','Coding', 'Yoga', 'Photography', 'Dance', 'Language', 'Fitness','Sports'].map((skill) => (
                                    <button
                                        key={skill}
                                        onClick={() => handleQuickSearch(skill)}
                                        className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm hover:border-yellow-400 hover:text-yellow-600 transition-all"
                                    >
                                        <MapPin className="w-3 h-3" />
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}