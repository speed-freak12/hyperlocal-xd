// components/Dashboard/DashboardSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageCircle,
    Users,
    Bell,
    User,
    Search
} from "lucide-react";

export default function DashboardSidebar() {
    const location = useLocation();

    const navigation = [
        { id: "overview", name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
        { id: "discover", name: "Discover People", icon: Search, path: "/dashboard/discover" },
        { id: "requests", name: "Requests", icon: Bell, path: "/dashboard/requests" },
        { id: "messages", name: "Messages", icon: MessageCircle, path: "/dashboard/messages" },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">
                    <Link to="/">Hyperlocal</Link>
                </h1>
            </div>

            <nav className="p-4 space-y-1">
                {navigation.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}