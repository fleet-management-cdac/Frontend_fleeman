'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import Spinner from '../../../../components/ui/Spinner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const bookingId = params.id;

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Handover state
    const [step, setStep] = useState(1); // 1: Details, 2: Select Vehicle, 3: Handover Form
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [fuelStatus, setFuelStatus] = useState('full');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Return/Invoice state
    const [invoice, setInvoice] = useState(null);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState(null);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                credentials: 'omit'
            });
            const data = await response.json();
            if (data.success) {
                setBooking(data.data);
            } else {
                setError(data.message || 'Booking not found');
            }
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableVehicles = async () => {
        if (!booking) return;

        try {
            console.log('Fetching vehicles for booking:', booking);

            // Build API URL with query params
            const params = new URLSearchParams();
            if (booking.vehicleTypeId) params.append('vehicleTypeId', booking.vehicleTypeId);
            // Note: We could also add hubId and date filters if needed

            const url = `${API_BASE_URL}/api/vehicles/available-for-handover?${params.toString()}`;
            console.log('Fetching from:', url);

            const response = await fetch(url, { credentials: 'omit' });
            const vehicles = await response.json();

            console.log('Available vehicles:', vehicles);
            setAvailableVehicles(Array.isArray(vehicles) ? vehicles : []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setAvailableVehicles([]);
        }
    };

    const handleStartHandover = async () => {
        await fetchAvailableVehicles();
        setStep(2);
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setStep(3);
    };

    const handleCompleteHandover = async () => {
        if (!selectedVehicle || !user?.id) return;

        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/api/handovers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
                body: JSON.stringify({
                    bookingId: parseInt(bookingId),
                    processedBy: user.id,
                    vehicleId: selectedVehicle.vehicleId,
                    fuelStatus: fuelStatus
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `✅ Handover complete! Vehicle ${selectedVehicle.registrationNo} has been handed over.`
                });
                // Refresh booking data
                setTimeout(() => {
                    router.push('/staff/dashboard');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Handover failed' });
            }
        } catch (error) {
            console.error('Handover error:', error);
            setMessage({ type: 'error', text: 'Failed to process handover' });
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleReturn = async () => {
        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/api/invoices/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
                body: JSON.stringify({
                    bookingId: parseInt(bookingId),
                    actualReturnDate: returnDate
                })
            });

            const data = await response.json();

            if (data.success) {
                setInvoice(data.data);
                setMessage({ type: 'success', text: '✅ Vehicle returned! Invoice generated.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Return failed' });
            }
        } catch (error) {
            console.error('Return error:', error);
            setMessage({ type: 'error', text: 'Failed to process return' });
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    const handlePayment = async () => {
        if (!invoice) return;

        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            // Step 1: Create Razorpay order
            const orderResponse = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
                body: JSON.stringify({ invoiceId: invoice.invoiceId })
            });

            const orderData = await orderResponse.json();

            if (!orderData.success) {
                setMessage({ type: 'error', text: orderData.message || 'Failed to create order' });
                setProcessing(false);
                return;
            }

            const { orderId, amount, keyId } = orderData.data;

            // Step 2: Open Razorpay checkout
            const options = {
                key: keyId,
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                name: 'Fleet Management',
                description: `Invoice #${invoice.invoiceId}`,
                order_id: orderId,
                handler: async function (response) {
                    // Step 3: Verify payment
                    try {
                        const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'omit',
                            body: JSON.stringify({
                                invoiceId: invoice.invoiceId,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            setTransactionId(verifyData.data.transactionId);
                            setPaymentSuccess(true);
                            setMessage({ type: 'success', text: '✅ Payment successful!' });
                        } else {
                            setMessage({ type: 'error', text: verifyData.message || 'Payment verification failed' });
                        }
                    } catch (err) {
                        console.error('Verify error:', err);
                        setMessage({ type: 'error', text: 'Payment verification failed' });
                    }
                    setProcessing(false);
                },
                prefill: {
                    name: invoice.customerName,
                    email: invoice.customerEmail
                },
                theme: {
                    color: '#3b82f6'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment error:', error);
            setMessage({ type: 'error', text: 'Failed to initiate payment' });
            setProcessing(false);
        }
    };

    const filteredVehicles = availableVehicles.filter(v => {
        if (!vehicleSearch.trim()) return true;
        const query = vehicleSearch.toLowerCase();
        return (
            (v.company || '').toLowerCase().includes(query) ||
            (v.model || '').toLowerCase().includes(query) ||
            (v.registrationNo || '').toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="p-8 text-center">
                    <p className="text-red-500 text-lg">{error}</p>
                    <Button onClick={() => router.back()} className="mt-4">← Go Back</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm mb-2">
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Booking #{bookingId}</h1>
                </div>
                <Badge status={booking?.status} className="text-lg px-4 py-2">{booking?.status}</Badge>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Step 1: Booking Details */}
            {step === 1 && (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">👤 Customer Details</h2>
                        <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">Name:</span> <span className="font-medium">{booking?.firstName} {booking?.lastName}</span></div>
                            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{booking?.email}</span></div>
                            <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{booking?.phoneCell || 'N/A'}</span></div>
                            <div><span className="text-gray-500">License:</span> <span className="font-medium">{booking?.drivingLicenseNo || 'N/A'}</span></div>
                        </div>
                    </Card>

                    {/* Booking Info */}
                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">📋 Booking Details</h2>
                        <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">Vehicle Type:</span> <span className="font-medium text-blue-600">{booking?.vehicleTypeName || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Rate Plan:</span> <span className="font-medium">{booking?.ratePlan || 'Daily'}</span></div>
                            <div><span className="text-gray-500">Created:</span> <span className="font-medium">{formatDate(booking?.createdAt)}</span></div>
                        </div>
                    </Card>

                    {/* Pickup/Return Info */}
                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">📍 Location & Time</h2>
                        <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">Pickup Hub:</span> <span className="font-medium">{booking?.pickupHub}</span></div>
                            <div><span className="text-gray-500">Pickup Time:</span> <span className="font-medium">{formatDate(booking?.pickupDatetime)}</span></div>
                            <div><span className="text-gray-500">Return Hub:</span> <span className="font-medium">{booking?.returnHub}</span></div>
                            <div><span className="text-gray-500">Return Time:</span> <span className="font-medium">{formatDate(booking?.returnDatetime)}</span></div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Step 2: Select Vehicle */}
            {step === 2 && (
                <Card>
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Select Vehicle for Handover</h2>
                                <p className="text-sm text-gray-500">
                                    Showing available <strong className="text-blue-600">{booking?.vehicleTypeName || 'vehicles'}</strong> at <strong>{booking?.pickupHub}</strong>
                                </p>
                            </div>
                            <Button variant="ghost" onClick={() => setStep(1)}>← Back to Details</Button>
                        </div>
                        <input
                            type="text"
                            placeholder="🔍 Search vehicles..."
                            value={vehicleSearch}
                            onChange={(e) => setVehicleSearch(e.target.value)}
                            className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {filteredVehicles.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No available vehicles found at this hub</div>
                        ) : (
                            filteredVehicles.map((vehicle) => (
                                <div
                                    key={vehicle.vehicleId}
                                    onClick={() => handleSelectVehicle(vehicle)}
                                    className="p-4 cursor-pointer hover:bg-green-50 transition flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{vehicle.company} {vehicle.model}</p>
                                        <p className="text-sm text-gray-500">{vehicle.registrationNo}</p>
                                        <p className="text-xs text-gray-400">{vehicle.vehicleTypeName}</p>
                                    </div>
                                    <Badge status="available">Available</Badge>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            )}

            {/* Step 3: Handover Form */}
            {step === 3 && selectedVehicle && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Handover Form</h2>
                            <Button variant="ghost" onClick={() => { setSelectedVehicle(null); setStep(2); }}>← Change Vehicle</Button>
                        </div>

                        <div className="space-y-4">
                            {/* Selected Vehicle */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-gray-500">Selected Vehicle</p>
                                <p className="font-bold text-lg text-green-700">{selectedVehicle.company} {selectedVehicle.model}</p>
                                <p className="font-medium">{selectedVehicle.registrationNo}</p>
                            </div>

                            {/* Fuel Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Status at Handover *</label>
                                <select
                                    value={fuelStatus}
                                    onChange={(e) => setFuelStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="full">Full Tank</option>
                                    <option value="3/4">3/4 Tank</option>
                                    <option value="1/2">Half Tank</option>
                                    <option value="1/4">1/4 Tank</option>
                                    <option value="empty">Empty</option>
                                </select>
                            </div>

                            <Button
                                onClick={handleCompleteHandover}
                                disabled={processing}
                                className="w-full"
                                size="lg"
                            >
                                {processing ? 'Processing...' : '🔑 Complete Handover'}
                            </Button>
                        </div>
                    </Card>

                    {/* Summary */}
                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Handover Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Booking ID</span>
                                <span className="font-medium">#{bookingId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Customer</span>
                                <span className="font-medium">{booking?.firstName} {booking?.lastName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium">{booking?.phoneCell}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Vehicle</span>
                                <span className="font-medium">{selectedVehicle.company} {selectedVehicle.model}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Registration</span>
                                <span className="font-medium">{selectedVehicle.registrationNo}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Pickup Hub</span>
                                <span className="font-medium">{booking?.pickupHub}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Pickup Time</span>
                                <span className="font-medium">{formatDate(booking?.pickupDatetime)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Return Time</span>
                                <span className="font-medium">{formatDate(booking?.returnDatetime)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Action Button - Only show on Step 1 for reserved bookings */}
            {step === 1 && booking?.status === 'reserved' && (
                <div className="mt-6">
                    <Button onClick={handleStartHandover} size="lg" className="w-full md:w-auto">
                        🔑 Start Handover Process
                    </Button>
                </div>
            )}

            {/* Return Vehicle - For Active bookings */}
            {step === 1 && booking?.status === 'active' && !invoice && (
                <Card className="mt-6 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🚗 Return Vehicle</h3>
                    <p className="text-sm text-gray-600 mb-4">Vehicle is currently with customer. Process return when they bring it back.</p>

                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Actual Return Date</label>
                            <input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button onClick={handleReturn} disabled={processing} size="lg">
                            {processing ? 'Processing...' : '📋 Generate Invoice'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Invoice Display */}
            {invoice && (
                <Card className="mt-6 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">📋 Invoice #{invoice.invoiceId}</h3>
                        <Badge status="completed" className="text-lg px-4 py-2">Generated</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Customer & Vehicle Info */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Customer</span>
                                <span className="font-medium">{invoice.customerName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Vehicle</span>
                                <span className="font-medium">{invoice.vehicleName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Registration</span>
                                <span className="font-medium">{invoice.vehicleRegistration}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Handover Date</span>
                                <span className="font-medium">{invoice.handoverDate}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Return Date</span>
                                <span className="font-medium">{invoice.returnDate}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Total Days</span>
                                <span className="font-bold text-blue-600">{invoice.totalDays} day(s)</span>
                            </div>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">💰 Pricing Breakdown</h4>
                            <div className="space-y-2 text-sm">
                                {invoice.daysCharged > 0 && (
                                    <div className="flex justify-between">
                                        <span>{invoice.daysCharged} day(s) × {formatCurrency(invoice.dailyRate)}</span>
                                        <span className="font-medium">{formatCurrency(invoice.dailyAmount)}</span>
                                    </div>
                                )}
                                {invoice.weeksCharged > 0 && (
                                    <div className="flex justify-between">
                                        <span>{invoice.weeksCharged} week(s) × {formatCurrency(invoice.weeklyRate)}</span>
                                        <span className="font-medium">{formatCurrency(invoice.weeklyAmount)}</span>
                                    </div>
                                )}
                                {invoice.monthsCharged > 0 && (
                                    <div className="flex justify-between">
                                        <span>{invoice.monthsCharged} month(s) × {formatCurrency(invoice.monthlyRate)}</span>
                                        <span className="font-medium">{formatCurrency(invoice.monthlyAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2">
                                    <span>Rental Amount</span>
                                    <span className="font-medium">{formatCurrency(invoice.rentalAmount)}</span>
                                </div>
                                {invoice.addonName && (
                                    <div className="flex justify-between">
                                        <span>{invoice.addonName}</span>
                                        <span className="font-medium">{formatCurrency(invoice.addonTotalAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 text-lg font-bold text-green-700">
                                    <span>Total Amount</span>
                                    <span>{formatCurrency(invoice.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Button */}
                    {!paymentSuccess ? (
                        <div className="mt-6 flex gap-4">
                            <Button
                                size="lg"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : `💳 Pay Now - ${formatCurrency(invoice.totalAmount)}`}
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/staff/dashboard')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                                <p className="text-green-800 font-bold text-lg">✅ Payment Successful!</p>
                                <p className="text-green-700">Transaction ID: <span className="font-mono font-bold">{transactionId}</span></p>
                            </div>
                            <Button onClick={() => router.push('/staff/dashboard')} className="w-full">
                                Back to Dashboard
                            </Button>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
