'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import Spinner from '../../../../components/ui/Spinner';
import BookingDetails from '../../../../components/staff/booking/BookingDetails';
import VehicleSelection from '../../../../components/staff/booking/VehicleSelection';
import HandoverForm from '../../../../components/staff/booking/HandoverForm';
import ReturnSection from '../../../../components/staff/booking/ReturnSection';
import InvoiceSection from '../../../../components/staff/booking/InvoiceSection';
import { getHubsByCity } from '../../../../services/locationService';

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
            fetchInvoiceForBooking();
        }
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
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

    const fetchInvoiceForBooking = async () => {
        if (!bookingId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/invoices/booking/${bookingId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'omit'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setInvoice(data.data);

                    // Check if payment is already successful
                    if (data.data.paymentStatus === 'success') {
                        setPaymentSuccess(true);
                        setTransactionId(data.data.razorpayPaymentId);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
        }
    };
    const fetchAvailableVehicles = async () => {
        if (!booking) return;

        try {
            console.log('Fetching vehicles for booking:', booking);

            const formatDateParam = (dateStr) => {
                if (!dateStr) return '';
                return new Date(dateStr).toISOString().split('T')[0];
            };

            let hubId = booking.pickupHubId || booking.hubId;

            // Fallback: If no hubId, try to find it via city and hub name
            if (!hubId && booking.cityId && booking.pickupHub) {
                try {
                    console.log('Hub ID missing, looking up by city:', booking.cityId);
                    const hubsResponse = await getHubsByCity(booking.cityId);
                    const hubs = Array.isArray(hubsResponse) ? hubsResponse : (hubsResponse.data || []);
                    const matchedHub = hubs.find(h =>
                        (h.hubName || h.name).toLowerCase() === booking.pickupHub.toLowerCase()
                    );
                    if (matchedHub) {
                        hubId = matchedHub.hubId || matchedHub.id;
                        console.log('Found matching hub ID:', hubId);
                    }
                } catch (err) {
                    console.error('Error looking up hub:', err);
                }
            }

            // Build API URL with query params
            const params = new URLSearchParams();

            // Mandatory params based on user request
            if (booking.vehicleTypeId) params.append('vehicleTypeId', booking.vehicleTypeId);

            // Send hubId compulsory
            if (hubId) {
                params.append('hubId', hubId);
            } else {
                console.warn('Hub ID missing in booking object and lookup failed, vehicle availability might fail');
            }

            if (booking.pickupDatetime) params.append('pickupDate', formatDateParam(booking.pickupDatetime));
            if (booking.returnDatetime) params.append('returnDate', formatDateParam(booking.returnDatetime));

            const url = `${API_BASE_URL}/api/vehicles/available?${params.toString()}`;
            console.log('Fetching from:', url);

            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'omit'
            });
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/handovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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



    const handleReturn = async () => {
        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/invoices/return`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    const handlePayment = async () => {
        if (!invoice) return;

        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            // Step 1: Create Razorpay order
            const token = localStorage.getItem('token');
            const orderResponse = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
                        const token = localStorage.getItem('token');
                        const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
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
            {step === 1 && <BookingDetails booking={booking} />}

            {/* Step 2: Select Vehicle */}
            {step === 2 && (
                <VehicleSelection
                    booking={booking}
                    availableVehicles={availableVehicles}
                    vehicleSearch={vehicleSearch}
                    setVehicleSearch={setVehicleSearch} // Pass the setter function
                    handleSelectVehicle={handleSelectVehicle}
                    setStep={setStep}
                />
            )}

            {/* Step 3: Handover Form */}
            {step === 3 && selectedVehicle && (
                <HandoverForm
                    booking={booking}
                    bookingId={bookingId}
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    setStep={setStep}
                    fuelStatus={fuelStatus}
                    setFuelStatus={setFuelStatus}
                    handleCompleteHandover={handleCompleteHandover}
                    processing={processing}
                />
            )}

            {/* Action Button - Only show on Step 1 for reserved bookings */}
            {step === 1 && booking?.status === 'reserved' && (
                <div className="mt-6">
                    <Button onClick={handleStartHandover} size="lg" className="w-full md:w-auto">
                        🔑 Start Handover Process
                    </Button>
                </div>
            )}

            {/* Return Vehicle - For Active OR Returned bookings */}
            {step === 1 && (booking?.status === 'active' || booking?.status === 'returned') && !invoice && (
                <ReturnSection
                    returnDate={returnDate}
                    setReturnDate={setReturnDate}
                    handleReturn={handleReturn}
                    processing={processing}
                />
            )}

            {/* Invoice Display */}
            {invoice && (
                <InvoiceSection
                    invoice={invoice}
                    paymentSuccess={paymentSuccess || booking?.status === 'completed'}
                    transactionId={transactionId}
                    handlePayment={handlePayment}
                    processing={processing}
                />
            )}
        </div>
    );
}
