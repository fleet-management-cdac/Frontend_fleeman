'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getBookingById, cancelBooking } from '../../../services/bookingService';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import { formatDateTime, formatCurrency } from '../../../lib/utils';
import { toast } from 'react-toastify';

export default function BookingDetailsPage({ params }) {
    const router = useRouter();
    // Use React.use() to unwrap params in Next.js 15+ (if needed), or async params
    // Safe to treat params as a promise in recent Next.js versions
    const { id } = use(params);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchBookingDetails();
        }
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const response = await getBookingById(id);
            if (response.success) {
                setBooking(response.data);
            } else {
                setError(response.message || 'Failed to fetch booking details');
            }
        } catch (err) {
            setError(err.message || 'Error loading booking');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const response = await cancelBooking(id);
            if (response.success) {
                toast.success('Booking cancelled successfully');
                fetchBookingDetails(); // Refresh details
            } else {
                toast.error(response.message || 'Failed to cancel booking');
            }
        } catch (error) {
            toast.error('Error cancelling booking');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
                <Footer />
            </>
        );
    }

    if (error || !booking) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
                        <p className="text-gray-500 mb-6">{error || 'The requested booking could not be found.'}</p>
                        <Button onClick={() => router.push('/my-bookings')}>Return to My Bookings</Button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                                <Badge status={booking.status}>{booking.status}</Badge>
                            </div>
                            <p className="text-gray-500">Booking ID: #{booking.bookingId || booking.id}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => router.back()}>Back</Button>
                            {booking.status === 'reserved' && (
                                <Button variant="danger" onClick={handleCancel}>Cancel Booking</Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Details */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Vehicle Info */}
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>🚗</span> Vehicle Information
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Vehicle</p>
                                        <p className="font-medium text-gray-900">
                                            {booking.vehicleName || booking.vehicleTypeName || 'Pending Assignment'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-medium text-gray-900">{booking.vehicleTypeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Registration</p>
                                        <p className="font-medium text-gray-900">
                                            {booking.vehicleRegistration || 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Schedule */}
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📅</span> Schedule
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start border-l-4 border-blue-500 pl-4 py-1">
                                        <div>
                                            <p className="text-sm text-gray-500">Pickup</p>
                                            <p className="font-medium text-gray-900">{formatDateTime(booking.pickupDatetime)}</p>
                                            <p className="text-sm text-gray-600">{booking.pickupHubName}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start border-l-4 border-green-500 pl-4 py-1">
                                        <div>
                                            <p className="text-sm text-gray-500">Return</p>
                                            <p className="font-medium text-gray-900">{formatDateTime(booking.returnDatetime)}</p>
                                            <p className="text-sm text-gray-600">{booking.returnHubName}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Payment & Customer */}
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>👤</span> Customer
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium break-all">{booking.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Phone</p>
                                        <p className="font-medium">{booking.phoneCell}</p>
                                    </div>
                                </div>
                            </Card>


                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

// Ensure params are correctly typed if using TypeScript, or handled as Promise in JS for Next 15+
// Since this is JS, the use() hook is the standard way for Next 15 async params.
