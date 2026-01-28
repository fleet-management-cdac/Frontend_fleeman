'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getAllBookings } from '../../../services/bookingService';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';

export default function StaffDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        reserved: 0,
        active: 0,
        todayPickups: 0,
        todayReturns: 0,
        completed: 0
    });
    const [allBookings, setAllBookings] = useState([]);
    const [displayedBookings, setDisplayedBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await getAllBookings();
            if (response.success) {
                const bookings = response.data || [];
                // Sort by date descending
                bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setAllBookings(bookings);
                setDisplayedBookings(bookings.slice(0, 10)); // Initial view: recent 10

                const today = new Date().toDateString();

                // Calculate stats
                const reservedTop = bookings.filter(b => b.status === 'reserved');
                const activeTop = bookings.filter(b => b.status === 'active');

                const pickupsToday = bookings.filter(b =>
                    new Date(b.pickupDatetime).toDateString() === today &&
                    b.status === 'reserved'
                );

                const returnsToday = bookings.filter(b =>
                    new Date(b.returnDatetime).toDateString() === today &&
                    b.status === 'active'
                );

                setStats({
                    reserved: reservedTop.length,
                    active: activeTop.length,
                    todayPickups: pickupsToday.length,
                    todayReturns: returnsToday.length,
                    completed: bookings.filter(b => b.status === 'completed').length
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setDisplayedBookings(allBookings.slice(0, 10)); // Reset to recent 10
            return;
        }

        const lowerTerm = term.toLowerCase();
        const filtered = allBookings.filter(booking =>
            (booking.bookingId?.toString().includes(lowerTerm) || booking.id?.toString().includes(lowerTerm)) ||
            (booking.firstName && booking.firstName.toLowerCase().includes(lowerTerm)) ||
            (booking.lastName && booking.lastName.toLowerCase().includes(lowerTerm)) ||
            (booking.vehicleTypeName && booking.vehicleTypeName.toLowerCase().includes(lowerTerm)) ||
            (booking.vehicleName && booking.vehicleName.toLowerCase().includes(lowerTerm))
        );
        setDisplayedBookings(filtered);
    };

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: 'short' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Overview of fleet operations for <span className="font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </p>
                    </div>

                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title="Pending Handovers"
                        value={stats.reserved}
                        icon="🔑"
                        trend="To be picked up"
                        color="blue"
                    />
                    <KpiCard
                        title="Active Rentals"
                        value={stats.active}
                        icon="🚗"
                        trend="Currently on road"
                        color="green"
                    />
                    <KpiCard
                        title="Due for Return"
                        value={stats.todayReturns}
                        icon="⏳"
                        trend="Expected today"
                        color="orange"
                    />
                    <KpiCard
                        title="Completed"
                        value={stats.completed}
                        icon="✅"
                        trend="Total completed"
                        color="gray"
                    />
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Main Content: Recent Bookings Table */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                                <h2 className="font-semibold text-gray-900">
                                    {searchTerm ? `Search Results (${displayedBookings.length})` : 'Recent Bookings'}
                                </h2>
                                <div className="w-full sm:w-72">
                                    <SearchBar onSearch={handleSearch} placeholder="Search by ID or Name..." />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-3">Booking ID</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Vehicle</th>
                                            <th className="px-6 py-3">Dates</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {displayedBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    {searchTerm ? 'No bookings found matching your search.' : 'No recent bookings found.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            displayedBookings.map((booking) => (
                                                <tr key={booking.bookingId || booking.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                                                    <td className="px-6 py-4 font-mono text-gray-600">
                                                        #{booking.bookingId || booking.id}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{booking.firstName} {booking.lastName}</div>
                                                        <div className="text-xs text-gray-500">{booking.phoneCell}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-900">{booking.vehicleTypeName || booking.vehicleName}</div>
                                                        <div className="text-xs text-gray-500">{booking.pickupHub}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                        {formatDate(booking.pickupDatetime)} <span className="mx-1">→</span> {formatDate(booking.returnDatetime)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge status={booking.status} className="capitalize" />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link
                                                            href={`/staff/bookings/${booking.bookingId || booking.id}`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:border-blue-300 rounded px-3 py-1.5 transition-colors"
                                                        >
                                                            Manage
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple KPI Card Component
function KpiCard({ title, value, icon, trend, color }) {
    return (
        <Card className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{value}</span>
                    </div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-xl">{icon}</div>
            </div>
            <div className="flex items-center text-xs">
                <span className="text-gray-400 font-medium">{trend}</span>
            </div>
        </Card>
    );
}
