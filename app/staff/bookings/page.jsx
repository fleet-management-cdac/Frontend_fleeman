'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllBookings, updateBookingStatus } from '../../../services/bookingService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Spinner from '../../../components/ui/Spinner';
import { formatDateTime } from '../../../lib/utils';

export default function StaffBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await getAllBookings();
            if (response.success) setBookings(response.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            const response = await updateBookingStatus(bookingId, newStatus);
            if (response.success) fetchBookings();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    // --- UPDATED FILTER LOGIC ---
    const filteredBookings = bookings.filter((booking) => {
        const searchTerm = search.toLowerCase();

        // FIX 1: Use booking.bookingId instead of booking.id
        const matchesId = booking.bookingId?.toString().includes(searchTerm);

        // FIX 2: Access nested user object for name
        const customerName = `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.toLowerCase();
        const matchesName = customerName.includes(searchTerm);

        // FIX 3: Access nested vehicle object for name
        const vehicleName = `${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`.toLowerCase();
        const matchesVehicle = vehicleName.includes(searchTerm);

        const matchesSearch = matchesId || matchesName || matchesVehicle;
        const matchesFilter = filter === 'all' || booking.status === filter;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
                <p className="text-gray-500">{bookings.length} total bookings</p>
            </div>

            <Card className="p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input placeholder="Search by ID, customer, or vehicle..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'reserved', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
                            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => (
                                // FIX: Use bookingId for key
                                <tr key={booking.bookingId || booking.id} className="hover:bg-gray-50">
                                    
                                    {/* FIX 1: Display bookingId */}
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        #{booking.bookingId}
                                    </td>

                                    {/* FIX 2: Display User Name correctly */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'N/A'}
                                    </td>

                                    {/* FIX 3: Display Vehicle Name correctly */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'N/A'}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(booking.pickupDatetime)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(booking.returnDatetime)}</td>
                                    <td className="px-6 py-4"><Badge status={booking.status}>{booking.status}</Badge></td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {/* FIX: Link uses bookingId */}
                                            <Link href={`/staff/bookings/${booking.bookingId}`}>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </Link>
                                            
                                            {booking.status === 'reserved' && (
                                                <Button variant="success" size="sm" onClick={() => handleStatusChange(booking.bookingId, 'confirmed')}>
                                                    Confirm
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredBookings.length === 0 && <div className="p-8 text-center text-gray-500">No bookings found</div>}
            </Card>
        </div>
    );
}