'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getAllBookings } from '../../../services/bookingService';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';

export default function StaffDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        reserved: 0,
        active: 0,
        todayPickups: 0,
        todayReturns: 0,
        completed: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
                <p className="text-gray-500">Here's what's happening today.</p>
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
            <div className="grid lg:grid-cols-2 gap-6">
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
                                <div key={booking.bookingId || booking.id} className="p-4 hover:bg-gray-50">
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
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Today's Schedule */}
                <Card>
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Today's Schedule</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-700">
                                🔑
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-yellow-800">Pickups Due</p>
                                <p className="text-sm text-yellow-600">{stats.todayPickups} customers waiting</p>
                            </div>
                            {stats.todayPickups > 0 && (
                                <Link href="/staff/handover" className="text-yellow-700 text-sm font-medium hover:underline">
                                    Start →
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                                ↩️
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-green-800">Returns Due</p>
                                <p className="text-sm text-green-600">{stats.todayReturns} vehicles expected</p>
                            </div>
                            {stats.todayReturns > 0 && (
                                <Link href="/staff/returns" className="text-green-700 text-sm font-medium hover:underline">
                                    Start →
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                                ✅
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-blue-800">Completed Today</p>
                                <p className="text-sm text-blue-600">{stats.completed} total completed</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
