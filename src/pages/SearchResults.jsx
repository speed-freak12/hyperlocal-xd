import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchComponent from '../components/SearchComponent';
import { MapPin, Filter, X, Zap, Search } from 'lucide-react';
import {
  getUserLocation,
  calculateDistance
} from '../utils/locationService';

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Active filters
  const [filters, setFilters] = useState({
    role: 'all',
    expertise: 'all',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  // Temporary filters
  const [tempFilters, setTempFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  // Get current user location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const coords = await getUserLocation();
        setCurrentLocation(coords);
      } catch (err) {
        console.warn('Location not available');
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
      searchUsers(queryParam);
    }
  }, [location, currentLocation]);

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
          userData.expertiseLevel || ''
        ]
          .join(' ')
          .toLowerCase();

        if (searchableText.includes(query.toLowerCase())) {
          let distance = null;

          if (
            currentLocation &&
            userData.latitude &&
            userData.longitude
          ) {
            distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              userData.latitude,
              userData.longitude
            );
          }

          results.push({
            id: doc.id,
            ...userData,
            distance
          });
        }
      });

      // Sort nearest first
      results.sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });

      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
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

          {/* Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Search Results
              </h1>
            </div>

            <SearchComponent
              placeholder="Search for skills, teachers, or topics..."
              className="mb-6"
            />

            <p className="text-gray-700 mb-6">
              {loading
                ? 'Searching...'
                : `Found ${filteredUsers.length} results for "${searchQuery}"`}
            </p>
          </div>

          {/* Results */}
          {!loading && filteredUsers.length > 0 && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="bg-white/90 backdrop-blur rounded-xl border border-blue-100 p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.username}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {user.location || 'Unknown'}
                          {user.distance && (
                            <span className="ml-2 text-blue-600 font-medium">
                              • {user.distance.toFixed(1)} km away
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user.skills?.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium mr-2"
                    >
                      <Zap className="w-3 h-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
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
