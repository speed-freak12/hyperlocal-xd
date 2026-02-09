import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchComponent from '../components/SearchComponent';
import { MapPin, Star, Users, Filter, X, Zap, Search } from 'lucide-react';

function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active filters
    const [filters, setFilters] = useState({
        role: 'all',
        expertise: 'all',
        location: '',
        minPrice: '',
        maxPrice: ''
    });

    // Temporary filters inside panel
    const [tempFilters, setTempFilters] = useState(filters);

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const queryParam = urlParams.get('q');
        if (queryParam) {
            setSearchQuery(queryParam);
            searchUsers(queryParam);
        }
    }, [location]);

    const searchUsers = async (query) => {
        setLoading(true);
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

            results.sort((a, b) => b.relevance - a.relevance);
            setUsers(results);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateRelevance = (userData, query) => {
        let relevance = 0;
        const queryLower = query.toLowerCase();

        if (userData.skills) {
            userData.skills.forEach(skill => {
                if (skill.toLowerCase() === queryLower) relevance += 5;
                else if (skill.toLowerCase().includes(queryLower)) relevance += 3;
            });
        }

        if (userData.name?.toLowerCase().includes(queryLower)) relevance += 4;
        if (userData.location?.toLowerCase().includes(queryLower)) relevance += 3;
        if (userData.bio?.toLowerCase().includes(queryLower)) relevance += 2;
        if (userData.role?.toLowerCase().includes(queryLower)) relevance += 2;

        return relevance;
    };

    // Apply filters to results
    const filteredUsers = users.filter(user => {
        if (filters.role !== 'all' && user.role !== filters.role) return false;
        if (filters.expertise !== 'all' && user.expertiseLevel !== filters.expertise) return false;

        if (filters.location) {
            if (!user.location?.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }
        }

        if (filters.minPrice) {
            const price = user.pricing?.rate || 0;
            if (price < Number(filters.minPrice)) return false;
        }

        if (filters.maxPrice) {
            const price = user.pricing?.rate || 0;
            if (price > Number(filters.maxPrice)) return false;
        }

        return true;
    });

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 pt-32 pb-20">
                <div className="container mx-auto px-6">

                    {/* Search header */}
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                ← Back
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
                        </div>

                        <SearchComponent
                            placeholder="Search for skills, teachers, or topics..."
                            className="mb-6"
                        />

                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-700">
                                {loading
                                    ? 'Searching...'
                                    : `Found ${filteredUsers.length} results for "${searchQuery}"`}
                            </p>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        {/* FILTER PANEL */}
                        {showFilters && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">Filters</h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {/* Role */}
                                    <select
                                        value={tempFilters.role}
                                        onChange={(e) =>
                                            setTempFilters(prev => ({ ...prev, role: e.target.value }))
                                        }
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="learner">Learner</option>
                                    </select>

                                    {/* Expertise */}
                                    <select
                                        value={tempFilters.expertise}
                                        onChange={(e) =>
                                            setTempFilters(prev => ({ ...prev, expertise: e.target.value }))
                                        }
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>

                                    {/* Location */}
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={tempFilters.location}
                                        onChange={(e) =>
                                            setTempFilters(prev => ({ ...prev, location: e.target.value }))
                                        }
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    />

                                    {/* Min Price */}
                                    <input
                                        type="number"
                                        placeholder="Min price"
                                        value={tempFilters.minPrice}
                                        onChange={(e) =>
                                            setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))
                                        }
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    />

                                    {/* Max Price */}
                                    <input
                                        type="number"
                                        placeholder="Max price"
                                        value={tempFilters.maxPrice}
                                        onChange={(e) =>
                                            setTempFilters(prev => ({ ...prev, maxPrice: e.target.value }))
                                        }
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() =>
                                            setTempFilters({
                                                role: 'all',
                                                expertise: 'all',
                                                location: '',
                                                minPrice: '',
                                                maxPrice: ''
                                            })
                                        }
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                                    >
                                        Clear
                                    </button>

                                    <button
                                        onClick={() => {
                                            setFilters(tempFilters);
                                            setShowFilters(false);
                                        }}
                                        className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RESULTS OR EMPTY STATE */}
                    {!loading && filteredUsers.length === 0 && (
                        <div className="max-w-2xl mx-auto text-center py-20">
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-10 border border-blue-100">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-blue-500" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    No skillmates found
                                </h3>

                                <p className="text-gray-600 mb-6">
                                    No one is offering <span className="font-semibold">{searchQuery}</span> yet.
                                    <br />
                                    Try another skill or be the first to teach it.
                                </p>

                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default SearchResults;
