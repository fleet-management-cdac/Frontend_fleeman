'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllBookings } from '../../../services/bookingService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';

export default function StaffDashboard() {
    const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0, pendingReturns: 0, todayPickups: 0 });
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
                setRecentBookings(bookings.slice(0, 5));
                const today = new Date().toDateString();
                setStats({
                    totalBookings: bookings.length,
                    activeBookings: bookings.filter(b => b.status === 'active').length,
                    pendingReturns: bookings.filter(b => b.status === 'active').length,
                    todayPickups: bookings.filter(b => new Date(b.pickupDatetime).toDateString() === today && b.status === 'confirmed').length,
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-500">Welcome back! Here's your overview.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <p className="text-blue-100 text-sm mb-1">Total Bookings</p>
                    <p className="text-4xl font-bold">{stats.totalBookings}</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <p className="text-green-100 text-sm mb-1">Active Rentals</p>
                    <p className="text-4xl font-bold">{stats.activeBookings}</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <p className="text-orange-100 text-sm mb-1">Pending Returns</p>
                    <p className="text-4xl font-bold">{stats.pendingReturns}</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <p className="text-purple-100 text-sm mb-1">Today's Pickups</p>
                    <p className="text-4xl font-bold">{stats.todayPickups}</p>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <Link href="/staff/handover" className="block">
                    <Card className="p-6 hover:shadow-md transition cursor-pointer h-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><span className="text-2xl">🔑</span></div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Vehicle Handover</h3>
                                <p className="text-sm text-gray-500">Process customer pickups</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/staff/returns" className="block">
                    <Card className="p-6 hover:shadow-md transition cursor-pointer h-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><span className="text-2xl">📄</span></div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Process Returns</h3>
                                <p className="text-sm text-gray-500">Handle vehicle returns & invoices</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/staff/bookings" className="block">
                    <Card className="p-6 hover:shadow-md transition cursor-pointer h-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><span className="text-2xl">📋</span></div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Manage Bookings</h3>
                                <p className="text-sm text-gray-500">View and manage all bookings</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            <Card>
                <Card.Header>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                        <Link href="/staff/bookings" className="text-blue-600 hover:underline text-sm">View all</Link>
                    </div>
                </Card.Header>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{booking.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{booking.customerName || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{booking.vehicleName || 'N/A'}</td>
                                    <td className="px-6 py-4"><Badge status={booking.status}>{booking.status}</Badge></td>
                                    <td className="px-6 py-4"><Link href={`/staff/bookings/${booking.id}`}><Button variant="ghost" size="sm">View</Button></Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
