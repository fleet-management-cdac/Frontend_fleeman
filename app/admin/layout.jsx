'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    const navItems = [
        { href: '/admin/staff', label: '👥 Staff Management' },
        { href: '/staff/vehicles', label: '🚗 All Vehicles' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">🛡️ Admin Panel</h1>
                        <span className="text-purple-200 text-sm">Fleet Management</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-purple-200">{user?.email}</span>
                        <Link href="/" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                            ← Back to App
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-3 font-medium transition border-b-2 ${pathname === item.href
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
