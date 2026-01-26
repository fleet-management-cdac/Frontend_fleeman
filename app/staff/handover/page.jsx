'use client';

import { useEffect, useState } from 'react';
import { getAllBookings } from '../../../services/bookingService';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function HandoverPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Step state
    const [step, setStep] = useState(1); // 1: Select Booking, 2: Select Vehicle, 3: Complete Handover
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [fuelStatus, setFuelStatus] = useState('full');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [searchQuery, bookings]);

    const fetchBookings = async () => {
        try {
            const response = await getAllBookings();
            if (response.success) {
                const reservedBookings = (response.data || []).filter(b => b.status === 'reserved');
                setBookings(reservedBookings);
                setFilteredBookings(reservedBookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        if (!searchQuery.trim()) {
            setFilteredBookings(bookings);
            return;
        }
        const query = searchQuery.toLowerCase().trim();
        const filtered = bookings.filter(b => {
            const bookingId = String(b.bookingId || b.id || '').toLowerCase();
            const customerName = ((b.firstName || '') + ' ' + (b.lastName || '')).toLowerCase();
            const email = (b.email || '').toLowerCase();
            return bookingId.includes(query) || customerName.includes(query) || email.includes(query);
        });
        setFilteredBookings(filtered);
    };

    const handleSelectBooking = async (booking) => {
        setSelectedBooking(booking);
        setMessage({ type: '', text: '' });

        // Fetch available vehicles filtered by pickup hub AND vehicle type
        try {
            const hubId = booking.pickupHubId;
            const vehicleTypeId = booking.vehicleTypeId;

            // Build URL with both filters
            let url = `${API_BASE_URL}/api/vehicles/available`;
            const params = [];
            if (hubId) params.push(`hubId=${hubId}`);
            if (vehicleTypeId) params.push(`vehicleTypeId=${vehicleTypeId}`);
            if (params.length > 0) url += '?' + params.join('&');

            const response = await fetch(url, { credentials: 'omit' });
            const vehicles = await response.json();
            setAvailableVehicles(Array.isArray(vehicles) ? vehicles : []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setAvailableVehicles([]);
        }

        setStep(2);
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setStep(3);
    };

    const handleBack = () => {
        if (step === 2) {
            setSelectedBooking(null);
            setSelectedVehicle(null);
            setStep(1);
        } else if (step === 3) {
            setSelectedVehicle(null);
            setStep(2);
        }
    };

    const handleHandover = async () => {
        if (!selectedBooking || !selectedVehicle) return;

        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            // Get staff ID from AuthContext (user comes from useAuth hook)
            const staffId = user?.id;

            if (!staffId) {
                setMessage({ type: 'error', text: 'Staff ID not found. Please login again.' });
                setProcessing(false);
                return;
            }

            const bookingId = selectedBooking.bookingId || selectedBooking.id;

            // Single API call - assigns vehicle + creates handover + updates booking status
            const handoverResponse = await fetch(`${API_BASE_URL}/api/handovers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
                body: JSON.stringify({
                    bookingId: bookingId,
                    processedBy: staffId,
                    vehicleId: selectedVehicle.vehicleId,
                    fuelStatus: fuelStatus
                })
            });

            const handoverData = await handoverResponse.json();

            if (handoverData.success) {
                setMessage({
                    type: 'success',
                    text: `✅ Handover complete! Booking #${bookingId} is now active with vehicle ${selectedVehicle.registrationNo}.`
                });

                // Reset and refresh
                setBookings(prev => prev.filter(b => (b.bookingId || b.id) !== bookingId));
                setSelectedBooking(null);
                setSelectedVehicle(null);
                setStep(1);
            } else {
                setMessage({ type: 'error', text: handoverData.message || 'Handover failed' });
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

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">🔑 Vehicle Handover</h1>
                <p className="text-gray-500">Select booking → Assign vehicle → Complete handover</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                    <span className="font-medium">Select Booking</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'}`}>2</span>
                    <span className="font-medium">Select Vehicle</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 3 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'}`}>3</span>
                    <span className="font-medium">Handover</span>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* STEP 1: Select Booking */}
            {step === 1 && (
                <Card>
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Step 1: Select Booking</h2>
                        <p className="text-sm text-gray-500">Search by booking ID, customer name, or email</p>
                        <input
                            type="text"
                            placeholder="🔍 Search bookings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {filteredBookings.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No reserved bookings found</div>
                        ) : (
                            filteredBookings.map((booking) => (
                                <div
                                    key={booking.bookingId || booking.id}
                                    onClick={() => handleSelectBooking(booking)}
                                    className="p-4 cursor-pointer hover:bg-blue-50 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                #{booking.bookingId || booking.id} - {booking.firstName} {booking.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{booking.email} | {booking.phoneCell}</p>
                                            <p className="text-sm text-gray-600 mt-1">📍 Pickup: {booking.pickupHub}</p>
                                        </div>
                                        <Badge status={booking.status}>{booking.status}</Badge>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        📅 {formatDate(booking.pickupDatetime)} → {formatDate(booking.returnDatetime)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            )}

            {/* STEP 2: Select Vehicle */}
            {step === 2 && selectedBooking && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Step 2: Select Vehicle</h2>
                                        <p className="text-sm text-gray-500">
                                            Showing available <strong className="text-blue-600">{selectedBooking.vehicleTypeName || 'vehicles'}</strong> at <strong>{selectedBooking.pickupHub}</strong>
                                        </p>
                                    </div>
                                    <Button variant="ghost" onClick={handleBack}>← Back</Button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="🔍 Search vehicles..."
                                    value={vehicleSearch}
                                    onChange={(e) => setVehicleSearch(e.target.value)}
                                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                                {filteredVehicles.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No available vehicles at this hub</div>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <div
                                            key={vehicle.vehicleId}
                                            onClick={() => handleSelectVehicle(vehicle)}
                                            className="p-4 cursor-pointer hover:bg-green-50 transition flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {vehicle.company} {vehicle.model}
                                                </p>
                                                <p className="text-sm text-gray-500">{vehicle.registrationNo}</p>
                                                <p className="text-xs text-gray-400">{vehicle.vehicleTypeName} | {vehicle.hubName}</p>
                                            </div>
                                            <Badge status="available">Available</Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                    <div>
                        <Card className="p-4 bg-blue-50">
                            <h3 className="font-semibold text-gray-900 mb-2">Selected Booking</h3>
                            <p className="text-xl font-bold text-blue-600">#{selectedBooking.bookingId || selectedBooking.id}</p>
                            <p className="font-medium">{selectedBooking.firstName} {selectedBooking.lastName}</p>
                            <p className="text-sm text-gray-500">{selectedBooking.email}</p>
                            <hr className="my-3" />
                            <p className="text-sm"><strong>Pickup:</strong> {selectedBooking.pickupHub}</p>
                            <p className="text-sm"><strong>Date:</strong> {formatDate(selectedBooking.pickupDatetime)}</p>
                        </Card>
                    </div>
                </div>
            )}

            {/* STEP 3: Complete Handover */}
            {step === 3 && selectedBooking && selectedVehicle && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Step 3: Complete Handover</h2>
                            <Button variant="ghost" onClick={handleBack}>← Back</Button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-gray-500">Booking</p>
                                <p className="font-bold text-xl text-blue-600">#{selectedBooking.bookingId || selectedBooking.id}</p>
                                <p className="font-medium">{selectedBooking.firstName} {selectedBooking.lastName}</p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-gray-500">Assigned Vehicle</p>
                                <p className="font-bold text-lg text-green-600">{selectedVehicle.company} {selectedVehicle.model}</p>
                                <p className="font-medium">{selectedVehicle.registrationNo}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fuel Status at Handover
                                </label>
                                <select
                                    value={fuelStatus}
                                    onChange={(e) => setFuelStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="full">Full Tank</option>
                                    <option value="3/4">3/4 Tank</option>
                                    <option value="1/2">Half Tank</option>
                                    <option value="1/4">1/4 Tank</option>
                                    <option value="empty">Empty</option>
                                </select>
                            </div>

                            <Button
                                onClick={handleHandover}
                                disabled={processing}
                                className="w-full"
                                size="lg"
                            >
                                {processing ? 'Processing...' : '🔑 Complete Handover'}
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Handover Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Customer</span>
                                <span className="font-medium">{selectedBooking.firstName} {selectedBooking.lastName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium">{selectedBooking.phoneCell}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Pickup Hub</span>
                                <span className="font-medium">{selectedBooking.pickupHub}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Return Hub</span>
                                <span className="font-medium">{selectedBooking.returnHub}</span>
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
                                <span className="text-gray-500">Pickup Date</span>
                                <span className="font-medium">{formatDate(selectedBooking.pickupDatetime)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Return Date</span>
                                <span className="font-medium">{formatDate(selectedBooking.returnDatetime)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
