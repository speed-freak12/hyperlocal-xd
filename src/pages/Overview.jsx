import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Loading from '../components/Loading';


export default function Overview() {
  const { user } = useAuth();
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
      const acceptedConnectionsQuery = query(
        connectionsRef,
        where('status', '==', 'accepted'),
        where('from', '==', user.uid)
      );
      const acceptedConnectionsSnapshot = await getDocs(acceptedConnectionsQuery);
      const acceptedConnectionsCount = acceptedConnectionsSnapshot.size;

      const receivedConnectionsQuery = query(
        connectionsRef,
        where('status', '==', 'accepted'),
        where('to', '==', user.uid)
      );
      const receivedConnectionsSnapshot = await getDocs(receivedConnectionsQuery);
      const receivedConnectionsCount = receivedConnectionsSnapshot.size;

      const totalConnections = acceptedConnectionsCount + receivedConnectionsCount;

      const pendingRequestsQuery = query(
        connectionsRef,
        where('status', '==', 'pending'),
        where('to', '==', user.uid)
      );
      const pendingRequestsSnapshot = await getDocs(pendingRequestsQuery);
      const pendingRequestsCount = pendingRequestsSnapshot.size;

      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(
        chatsRef,
        where('participants', 'array-contains', user.uid)
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      const messagesCount = chatsSnapshot.size;

      setStats({
        connections: totalConnections,
        messages: messagesCount,
        pendingRequests: pendingRequestsCount
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Connections',
            value: stats.connections,
            change: 'Your skillmates'
          },
          {
            title: 'Messages',
            value: stats.messages,
            change: 'Active conversations'
          },
          {
            title: 'Pending Requests',
            value: stats.pendingRequests,
            change: stats.pendingRequests > 0 ? 'Need attention' : 'All caught up'
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 ${stat.value > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/dashboard/discover"
          className="bg-linear-to-r from-blue-400 to-blue-500 rounded-xl p-6 text-white cursor-pointer block"
        >
          <h3 className="text-xl font-bold mb-2">Find People</h3>
          <p className="mb-4 opacity-90">Discover and connect with learners and teachers</p>
          <div className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-block">
            Explore People
          </div>
        </Link>

        <Link
          to="/dashboard/messages"
          className="bg-linear-to-r from-gray-900 to-black rounded-xl p-6 text-white cursor-pointer block"
        >
          <h3 className="text-xl font-bold mb-2">Your Messages</h3>
          <p className="mb-4 opacity-90">Continue your conversations</p>
          <div className="bg-black-400 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors inline-block">
            View Messages
          </div>
        </Link>
      </div>
    </div>
  );
}