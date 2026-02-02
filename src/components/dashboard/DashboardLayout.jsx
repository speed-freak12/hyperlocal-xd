import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout() {
    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-200 via-blue-50 to-blue-300">
            <DashboardSidebar />
            <div className="flex-1 overflow-auto">
                <DashboardHeader />
                <main className="p-2">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
