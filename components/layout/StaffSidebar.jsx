'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { name: 'Dashboard', href: '/staff/dashboard', icon: '📊' },
    { name: 'Bookings', href: '/staff/bookings', icon: '📋' },
    { name: 'Vehicles', href: '/staff/vehicles', icon: '🚗' },
    { name: 'Handover', href: '/staff/handover', icon: '🔑' },
    { name: 'Returns', href: '/staff/returns', icon: '📄' },
    { name: 'Hubs', href: '/staff/hubs', icon: '📍' },
];

export default function StaffSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <aside className={`bg-gray-900 text-white h-screen sticky top-0 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <Link href="/staff/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">F</span>
                    </div>
                    {!collapsed && <span className="font-bold text-xl">FLEMAN</span>}
                </Link>
            </div>

            {/* Menu */}
            <nav className="flex-1 py-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition
                ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-800">
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            <p className="text-xs text-gray-500">Staff</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className={`mt-3 w-full text-left text-gray-400 hover:text-white text-sm py-2 px-3 rounded hover:bg-gray-800 transition ${collapsed ? 'text-center' : ''}`}
                >
                    {collapsed ? '🚪' : 'Logout'}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white border border-gray-700"
            >
                {collapsed ? '→' : '←'}
            </button>
        </aside>
    );
}
