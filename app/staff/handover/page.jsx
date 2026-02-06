'use client';

import { useEffect, useState } from 'react';
import { getAllBookings, getBookingsByHub } from '../../../services/bookingService';
import { processReturnHandover } from '../../../services/handoverService';
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

    // Tab state for Pickup vs Return
    const [activeTab, setActiveTab] = useState('pickup');
    const [returnBookings, setReturnBookings] = useState([]);
    const [selectedReturnBooking, setSelectedReturnBooking] = useState(null);
    const [returnFuelStatus, setReturnFuelStatus] = useState('full');
    const [processingReturn, setProcessingReturn] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    useEffect(() => {
        filterBookings();
    }, [searchQuery, bookings]);

    const fetchBookings = async () => {
        try {
            let response;
            // Get bookings that involve this hub (either pickup OR return)
            if (user?.hubId) {
                response = await getBookingsByHub(user.hubId);
            } else {
                response = await getAllBookings();
            }

            if (response.success) {
                const allBookings = response.data || [];

                let reserved = allBookings.filter(b => b.status === 'reserved');
                let active = allBookings.filter(b => b.status === 'active');

                // Logic Refinement: Strict separation of duties
                // If I am staff at Hub A:
                // - I should only see Pickups starting from Hub A
                // - I should only see Returns ending at Hub A
                if (user?.hubId) {
                    const userHubId = String(user.hubId);

                    // Filter Pickups: Must be picking up FROM my hub
                    reserved = reserved.filter(b => String(b.pickupHubId) === userHubId);

                    // Filter Returns: Must be returning TO my hub
                    active = active.filter(b => String(b.returnHubId) === userHubId);
                }

                setBookings(reserved);
                setFilteredBookings(reserved);
                setReturnBookings(active);
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

            // Build URL with filters
            // CHANGED: Use /available-for-handover and REMOVE vehicleTypeId to show ALL available vehicles at the hub
            // This allows upgrading/downgrading at the counter
            let url = `${API_BASE_URL}/api/vehicles/available-for-handover`;
            const params = [];

            // Only filter by Date and Hub. Ignore booked vehicle type.
            if (hubId) params.push(`hubId=${hubId}`);
            if (booking.pickupDatetime) params.push(`pickupDate=${new Date(booking.pickupDatetime).toISOString().split('T')[0]}`);
            if (booking.returnDatetime) params.push(`returnDate=${new Date(booking.returnDatetime).toISOString().split('T')[0]}`);

            if (params.length > 0) url += '?' + params.join('&');

            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'omit'
            });
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

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleHandover = () => {
        if (!selectedBooking || !selectedVehicle) return;
        setShowConfirmModal(true);
    };

    const processHandover = async () => {
        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            // Get staff ID from AuthContext (user comes from useAuth hook)
            const staffId = user?.id;

            if (!staffId) {
                setMessage({ type: 'error', text: 'Staff ID not found. Please login again.' });
                setShowConfirmModal(false);
                setProcessing(false);
                return;
            }

            const bookingId = selectedBooking.bookingId || selectedBooking.id;

            // Single API call - assigns vehicle + creates handover + updates booking status
            const token = localStorage.getItem('token');
            const handoverResponse = await fetch(`${API_BASE_URL}/api/handovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
                setShowConfirmModal(false);
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
                setShowConfirmModal(false);
            }
        } catch (error) {
            console.error('Handover error:', error);
            setMessage({ type: 'error', text: 'Failed to process handover' });
            setShowConfirmModal(false);
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

    // Handle Return Handover
    const handleReturnHandover = async () => {
        if (!selectedReturnBooking) return;

        setProcessingReturn(true);
        setMessage({ type: '', text: '' });

        try {
            const staffId = user?.id;
            if (!staffId) {
                setMessage({ type: 'error', text: 'Staff ID not found. Please login again.' });
                setProcessingReturn(false);
                return;
            }

            const bookingId = selectedReturnBooking.bookingId || selectedReturnBooking.id;

            const response = await processReturnHandover({
                bookingId: bookingId,
                processedBy: staffId,
                fuelStatus: returnFuelStatus
            });

            if (response.success) {
                setMessage({
                    type: 'success',
                    text: response.message || `✅ Return processed! Vehicle is now available at the return hub.`
                });

                // Remove from active bookings list
                setReturnBookings(prev => prev.filter(b => (b.bookingId || b.id) !== bookingId));
                setSelectedReturnBooking(null);
            } else {
                setMessage({ type: 'error', text: response.message || 'Return processing failed' });
            }
        } catch (error) {
            console.error('Return handover error:', error);
            setMessage({ type: 'error', text: 'Failed to process return handover' });
        } finally {
            setProcessingReturn(false);
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">🔑 Vehicle Handover</h1>
                <p className="text-gray-500">Process pickups and returns{user?.hubId ? ' for your hub' : ''}</p>
            </div>

            {/* Tab Switcher */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => { setActiveTab('pickup'); setStep(1); setSelectedReturnBooking(null); }}
                    className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'pickup' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    🚗 Pickup Handover ({bookings.length})
                </button>
                <button
                    onClick={() => { setActiveTab('return'); setStep(1); setSelectedBooking(null); setSelectedVehicle(null); }}
                    className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'return' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    🔙 Return Handover ({returnBookings.length})
                </button>
            </div>
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

            {/* ============== RETURN TAB ============== */}
            {activeTab === 'return' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">🔙 Process Vehicle Return</h2>
                                <p className="text-sm text-gray-500">Select an active booking to process return</p>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                                {returnBookings.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No active bookings awaiting return</div>
                                ) : (
                                    returnBookings.map((booking) => (
                                        <div
                                            key={booking.bookingId || booking.id}
                                            onClick={() => setSelectedReturnBooking(booking)}
                                            className={`p-4 cursor-pointer hover:bg-green-50 transition ${selectedReturnBooking?.id === booking.id || selectedReturnBooking?.bookingId === booking.bookingId ? 'bg-green-100 border-l-4 border-green-500' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        #{booking.bookingId || booking.id} - {booking.firstName || booking.customerName} {booking.lastName || ''}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{booking.email}</p>
                                                    <p className="text-sm text-gray-600 mt-1">📍 Return to: <strong>{booking.returnHub}</strong></p>
                                                </div>
                                                <Badge status={booking.status}>{booking.status}</Badge>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                🚗 {booking.vehicleTypeName} | Due: {formatDate(booking.returnDatetime)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Return Confirmation Panel */}
                    <div>
                        {selectedReturnBooking ? (
                            <Card className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Confirm Return</h3>
                                <div className="space-y-3 text-sm mb-4">
                                    <p><strong>Booking:</strong> #{selectedReturnBooking.bookingId || selectedReturnBooking.id}</p>
                                    <p><strong>Customer:</strong> {selectedReturnBooking.firstName || selectedReturnBooking.customerName} {selectedReturnBooking.lastName || ''}</p>
                                    <p><strong>Return Hub:</strong> {selectedReturnBooking.returnHub}</p>
                                    <p><strong>Vehicle Type:</strong> {selectedReturnBooking.vehicleTypeName}</p>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Status at Return</label>
                                    <select
                                        value={returnFuelStatus}
                                        onChange={(e) => setReturnFuelStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="full">Full Tank</option>
                                        <option value="3/4">3/4 Tank</option>
                                        <option value="1/2">Half Tank</option>
                                        <option value="1/4">1/4 Tank</option>
                                        <option value="empty">Empty</option>
                                    </select>
                                </div>
                                <Button
                                    onClick={handleReturnHandover}
                                    disabled={processingReturn}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    size="lg"
                                >
                                    {processingReturn ? 'Processing...' : '✅ Complete Return'}
                                </Button>
                                <p className="mt-3 text-xs text-gray-500 text-center">
                                    Vehicle will be marked available at <strong>{selectedReturnBooking.returnHub}</strong>
                                </p>
                            </Card>
                        ) : (
                            <Card className="p-6 bg-gray-50 text-center">
                                <p className="text-gray-500">Select a booking to process return</p>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* ============== PICKUP TAB ============== */}
            {/* STEP 1: Select Booking */}
            {activeTab === 'pickup' && step === 1 && (
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
            {activeTab === 'pickup' && step === 2 && selectedBooking && (
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
            {activeTab === 'pickup' && step === 3 && selectedBooking && selectedVehicle && (
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
                                {/* Handover Confirmation Modal */}
                                {showConfirmModal && selectedBooking && selectedVehicle && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[5px] bg-white/30">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 transform transition-all scale-100">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="text-2xl">🔑</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">Confirm Handover</h3>
                                                <p className="text-gray-500 mt-2">
                                                    Please verify the details before handing over the keys.
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3 text-sm">
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-gray-500">Customer</span>
                                                    <span className="font-medium text-gray-900">{selectedBooking.firstName} {selectedBooking.lastName}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-gray-500">Vehicle</span>
                                                    <span className="font-medium text-gray-900">{selectedVehicle.company} {selectedVehicle.model}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-gray-500">Registration</span>
                                                    <span className="font-medium text-gray-900">{selectedVehicle.registrationNo}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Fuel Level</span>
                                                    <span className="font-bold text-purple-600 capitalize">{fuelStatus}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowConfirmModal(false)}
                                                    className="flex-1"
                                                    disabled={processing}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={processHandover}
                                                    loading={processing}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Confirm Handover
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
