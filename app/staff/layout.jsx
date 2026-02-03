'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import StaffSidebar from '../../components/layout/StaffSidebar';
import Spinner from '../../components/ui/Spinner';

export default function StaffLayout({ children }) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in - redirect to staff login
                router.replace('/login');
            } else if (user.role !== 'staff' && user.role !== 'admin') {
                // Logged in but not staff or admin - redirect to customer dashboard
                router.replace('/');
            } else {
                // Staff or Admin user - allow access
                setAuthorized(true);
            }
        }
    }, [user, loading, router]);

    // Show loading while checking auth
    if (loading || !authorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <StaffSidebar />
            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
