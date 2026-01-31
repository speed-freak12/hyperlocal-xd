import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Loading from '../components/Loading';

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    pendingRequests: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      const connectionsRef = collection(db, 'connections');

      const acceptedFromQuery = query(
        connectionsRef,
        where('status', '==', 'accepted'),
        where('from', '==', user.uid)
      );
      const acceptedFromSnap = await getDocs(acceptedFromQuery);

      const acceptedToQuery = query(
        connectionsRef,
        where('status', '==', 'accepted'),
        where('to', '==', user.uid)
      );
      const acceptedToSnap = await getDocs(acceptedToQuery);

      const totalConnections =
        acceptedFromSnap.size + acceptedToSnap.size;

      const pendingQuery = query(
        connectionsRef,
        where('status', '==', 'pending'),
        where('to', '==', user.uid)
      );
      const pendingSnap = await getDocs(pendingQuery);

      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(
        chatsRef,
        where('participants', 'array-contains', user.uid)
      );
      const chatsSnap = await getDocs(chatsQuery);

      setStats({
        connections: totalConnections,
        messages: chatsSnap.size,
        pendingRequests: pendingSnap.size
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-8 space-y-6">

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Connections (no navigation) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Connections</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.connections}
          </p>
          <p className="text-sm mt-1 text-green-600">
            Your skillmates
          </p>
        </div>

        {/* Messages (clickable) */}
        <div
          onClick={() => navigate('/dashboard/messages')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition"
        >
          <p className="text-sm font-medium text-gray-600">Messages</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.messages}
          </p>
          <p className={`text-sm mt-1 ${stats.messages > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            Active conversations
          </p>
        </div>

        {/* Pending Requests (clickable) */}
        <div
          onClick={() => navigate('/dashboard/requests')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition"
        >
          <p className="text-sm font-medium text-gray-600">Pending Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.pendingRequests}
          </p>
          <p className={`text-sm mt-1 ${stats.pendingRequests > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {stats.pendingRequests > 0 ? 'Need attention' : 'All caught up'}
          </p>
        </div>

      </div>

      {/* ===== QUICK ACTION CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Link
          to="/dashboard/discover"
          className="bg-linear-to-r from-blue-400 to-blue-500 rounded-xl p-6 text-white block"
        >
          <h3 className="text-xl font-bold mb-2">Find People</h3>
          <p className="mb-4 opacity-90">
            Discover and connect with learners and teachers
          </p>
          <div className="bg-black text-white px-6 py-2 rounded-lg font-medium inline-block">
            Explore People
          </div>
        </Link>

        <Link
          to="/dashboard/messages"
          className="bg-linear-to-r from-gray-900 to-black rounded-xl p-6 text-white block"
        >
          <h3 className="text-xl font-bold mb-2">Your Messages</h3>
          <p className="mb-4 opacity-90">
            Continue your conversations
          </p>
          <div className="bg-black text-white px-6 py-2 rounded-lg font-medium inline-block">
            View Messages
          </div>
        </Link>

      </div>
    </div>
  );
}
