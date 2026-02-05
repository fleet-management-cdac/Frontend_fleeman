'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllBookings, getBookingsByHub, updateBookingStatus } from '../../../services/bookingService';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Spinner from '../../../components/ui/Spinner';
import { formatDateTime } from '../../../lib/utils';

export default function StaffBookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [noHubAssigned, setNoHubAssigned] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            let response;
            // Since staff can now process returns at ANY hub, show all bookings
            // Staff can only handover at their pickup hub (validated in booking detail page)
            // But they need to see all active bookings for potential return processing
            if (user?.role === 'admin') {
                response = await getAllBookings();
            } else if (user?.hubId) {
                // Staff with assigned hub: show ALL bookings for flexible return processing
                // The booking detail page handles permission for handover vs return
                response = await getAllBookings();
                setNoHubAssigned(false);
            } else {
                // Staff without hub assignment
                response = await getAllBookings();
                if (user?.role === 'staff') {
                    setNoHubAssigned(true);
                }
            }
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

    const filteredBookings = bookings.filter((booking) => {
        const vehicleInfo = booking.vehicleTypeName || booking.vehicleName || '';
        const matchesSearch = booking.id.toString().includes(search) || booking.customerName?.toLowerCase().includes(search.toLowerCase()) || vehicleInfo.toLowerCase().includes(search.toLowerCase());
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
                <p className="text-gray-500">{bookings.length} total bookings{user?.hubId ? ` (You can handover at your hub, returns at any hub)` : ''}</p>
            </div>

            {noHubAssigned && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 font-medium">⚠️ No Hub Assigned</p>
                    <p className="text-amber-700 text-sm">You can view all bookings but need a hub assignment to process handovers and returns.</p>
                </div>
            )}

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
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{booking.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{booking.customerName || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{booking.vehicleTypeName || booking.vehicleName || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(booking.pickupDatetime)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(booking.returnDatetime)}</td>
                                    <td className="px-6 py-4"><Badge status={booking.status}>{booking.status}</Badge></td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link href={`/staff/bookings/${booking.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                                            {booking.status === 'reserved' && (
                                                <Button variant="success" size="sm" onClick={() => handleStatusChange(booking.id, 'confirmed')}>Confirm</Button>
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
