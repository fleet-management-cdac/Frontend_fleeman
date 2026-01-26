'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getAllBookings } from '../../../services/bookingService';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        reserved: 0,
        active: 0,
        todayPickups: 0,
        todayReturns: 0,
        completed: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchId, setSearchId] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await getAllBookings();
            if (response.success) {
                const bookings = response.data || [];
                const today = new Date().toDateString();

                setStats({
                    reserved: bookings.filter(b => b.status === 'reserved').length,
                    active: bookings.filter(b => b.status === 'active').length,
                    todayPickups: bookings.filter(b =>
                        new Date(b.pickupDatetime).toDateString() === today &&
                        b.status === 'reserved'
                    ).length,
                    todayReturns: bookings.filter(b =>
                        new Date(b.returnDatetime).toDateString() === today &&
                        b.status === 'active'
                    ).length,
                    completed: bookings.filter(b => b.status === 'completed').length
                });

                // Get recent 5 bookings sorted by date
                const recent = [...bookings]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setRecentBookings(recent);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Search Handler ---
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchId.trim()) {
            // Navigate to the specific booking details page
            router.push(`/staff/bookings/${searchId}`);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            reserved: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                {/* Left Side: Welcome Text */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Welcome back Staff ! <span>👋</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Here's what's happening today.</p>
                </div>

           {/* Right Side: Search Form */}
                <form onSubmit={handleSearch} className="w-full md:w-auto">
                    <div className="flex w-full md:w-96 shadow-sm rounded-lg overflow-hidden border border-gray-300">
                        <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="w-full py-2.5 pl-10 pr-4 text-sm text-gray-900 bg-white focus:outline-none"
                                placeholder="Search by Booking ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
            

            {/* Today's Summary */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="p-5 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Awaiting Handover</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.reserved}</p>
                        </div>
                        <div className="text-3xl">🔑</div>
                    </div>
                </Card>
                <Card className="p-5 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Rentals</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                        <div className="text-3xl">🚗</div>
                    </div>
                </Card>
                <Card className="p-5 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Today's Pickups</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.todayPickups}</p>
                        </div>
                        <div className="text-3xl">📅</div>
                    </div>
                </Card>
                <Card className="p-5 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Today's Returns</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.todayReturns}</p>
                        </div>
                        <div className="text-3xl">↩️</div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Link href="/staff/handover">
                    <Card className="p-6 hover:shadow-lg transition cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition">
                                🔑
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">Vehicle Handover</h3>
                                <p className="text-sm text-gray-500">Customer pickups • {stats.reserved} pending</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/staff/returns">
                    <Card className="p-6 hover:shadow-lg transition cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition">
                                ↩️
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">Process Returns</h3>
                                <p className="text-sm text-gray-500">Vehicle check-ins • {stats.active} active</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/staff/bookings">
                    <Card className="p-6 hover:shadow-lg transition cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition">
                                📋
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">All Bookings</h3>
                                <p className="text-sm text-gray-500">Search & manage all rentals</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Recent Bookings */}
            <div className="grid lg:grid-cols-1 gap-6">
                <Card>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
                        <Link href="/staff/bookings" className="text-sm text-blue-600 hover:underline">View all →</Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentBookings.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">No bookings yet</div>
                        ) : (
                            recentBookings.map((booking) => (
                                <Link
                                    key={booking.bookingId || booking.id}
                                    href={`/staff/bookings/${booking.bookingId || booking.id}`}
                                    className="block p-4 hover:bg-blue-50 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                #{booking.bookingId || booking.id} • {booking.firstName} {booking.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {booking.vehicleTypeName || booking.vehicleName || 'Vehicle'} • {booking.pickupHub}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDate(booking.pickupDatetime)} → {formatDate(booking.returnDatetime)}
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>
                </Card>

                
            </div>
        </div>
    );
}
