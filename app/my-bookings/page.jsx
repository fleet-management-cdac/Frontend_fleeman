'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getBookingsByUser, cancelBooking } from '../../services/bookingService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime, formatCurrency } from '../../lib/utils';

export default function MyBookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user?.id) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const response = await getBookingsByUser(user.id);
            if (response.success) {
                setBookings(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const response = await cancelBooking(bookingId);
            if (response.success) fetchBookings();
        } catch (error) {
            alert('Failed to cancel booking');
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (filter === 'all') return true;
        return booking.status === filter;
    });

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                            <p className="text-gray-500 mt-1">{bookings.length} total bookings</p>
                        </div>
                        <Link href="/vehicles" className="mt-4 sm:mt-0"><Button>New Booking</Button></Link>
                    </div>

                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {['all', 'reserved', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {filteredBookings.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-gray-500 mb-4">No bookings found</p>
                            <Link href="/vehicles"><Button>Browse Vehicles</Button></Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <Card key={booking.id} className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-2xl">🚗</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-lg">{booking.vehicleTypeName || booking.vehicleName || 'Vehicle'}</h3>
                                                    <p className="text-gray-500 text-sm">Booking #{booking.id}</p>
                                                    <div className="flex items-center gap-2 mt-2"><Badge status={booking.status}>{booking.status}</Badge></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Pickup</p>
                                                <p className="font-medium">{formatDateTime(booking.pickupDatetime)}</p>
                                                <p className="text-gray-500 text-xs">{booking.pickupHubName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Return</p>
                                                <p className="font-medium">{formatDateTime(booking.returnDatetime)}</p>
                                                <p className="text-gray-500 text-xs">{booking.returnHubName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {booking.totalAmount && (
                                                <div className="text-right">
                                                    <p className="text-gray-500 text-sm">Total</p>
                                                    <p className="font-bold text-xl text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Link href={`/booking/${booking.id}`}><Button variant="outline" size="sm">View</Button></Link>
                                                {booking.status === 'reserved' && (
                                                    <Button variant="danger" size="sm" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
