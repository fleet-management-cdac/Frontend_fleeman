'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getUserDetails } from '../../services/authService';
import { createBooking } from '../../services/bookingService';
import { getAddons } from '../../services/addonService';
import { getAllStates, getCitiesByState } from '../../services/locationService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-toastify';

function BookingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const vehicleId = searchParams.get('vehicleId');
    const rateId = searchParams.get('rateId');
    const pickupHub = searchParams.get('pickupHub');
    const dropHub = searchParams.get('dropHub');
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');

    // Rates for Smart Pricing
    const dailyRate = parseFloat(searchParams.get('dailyRate') || '0');
    const weeklyRate = parseFloat(searchParams.get('weeklyRate') || '0');
    const monthlyRate = parseFloat(searchParams.get('monthlyRate') || '0');

    // Now 4 steps: 1=Review, 2=Addons, 3=Customer Details, 4=Confirmation
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(true);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState('');

    // Addons state
    const [addons, setAddons] = useState([]);
    const [selectedAddonId, setSelectedAddonId] = useState(null);
    const [loadingAddons, setLoadingAddons] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        cityId: '',
        stateId: '',
        zipcode: '',
        phoneCell: '',
        drivingLicenseNo: '',
        licenseValidTill: '',
    });

    useEffect(() => {
        fetchStates();
        fetchAddons();
        if (user?.id && user.role !== 'staff') {
            fetchUserDetails();
        } else {
            setFetchingDetails(false);
        }
    }, [user]);

    useEffect(() => {
        if (formData.stateId) {
            fetchCities(formData.stateId);
        }
    }, [formData.stateId]);

    const fetchAddons = async () => {
        setLoadingAddons(true);
        try {
            const response = await getAddons();
            // Handle different response formats
            const addonData = response.data || response || [];
            setAddons(Array.isArray(addonData) ? addonData : []);
        } catch (error) {
            console.error('Error fetching addons:', error);
            setAddons([]);
        } finally {
            setLoadingAddons(false);
        }
    };

    const fetchStates = async () => {
        try {
            const response = await getAllStates();
            setStates(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const response = await getCitiesByState(stateId);
            setCities(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const response = await getUserDetails(user.id);
            if (response.success && response.data) {
                const details = response.data;
                setFormData({
                    firstName: details.firstName || '',
                    lastName: details.lastName || '',
                    email: details.email || user.email || '',
                    address: details.address || '',
                    cityId: details.cityId?.toString() || '',
                    stateId: '',
                    zipcode: details.zipcode || '',
                    phoneCell: details.phoneCell || '',
                    drivingLicenseNo: details.drivingLicenseNo || '',
                    licenseValidTill: details.licenseValidTill || '',
                });
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setFetchingDetails(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');

        if (name === 'stateId') {
            setFormData(prev => ({ ...prev, cityId: '' }));
            setCities([]);
        }
    };

    const validateForm = () => {
        if (!formData.firstName) return 'First name is required';
        if (!formData.email) return 'Email is required';
        if (!formData.phoneCell) return 'Mobile number is required';
        if (!formData.drivingLicenseNo) return 'Driving license number is required';
        if (!formData.licenseValidTill) return 'License validity date is required';
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formatDatetime = (dateStr) => {
                if (!dateStr) return null;
                if (dateStr.endsWith('Z') || dateStr.includes('+')) return dateStr;
                return dateStr.includes(':00:00') ? dateStr + 'Z' : dateStr + ':00Z';
            };

            const bookingPayload = {
                userId: user?.id || null,
                vehicleId: parseInt(vehicleId),
                rateId: parseInt(rateId) || 1,
                addonId: selectedAddonId,
                pickupHubId: parseInt(pickupHub),
                returnHubId: parseInt(dropHub) || parseInt(pickupHub),
                pickupDatetime: formatDatetime(pickupDate),
                returnDatetime: formatDatetime(returnDate),
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
                cityId: formData.cityId ? parseInt(formData.cityId) : 1,
                zipcode: formData.zipcode,
                phoneCell: formData.phoneCell,
                drivingLicenseNo: formData.drivingLicenseNo,
                licenseValidTill: formData.licenseValidTill,
            };

            console.log('Booking payload:', bookingPayload);

            const response = await createBooking(bookingPayload);

            if (response.success) {
                setBookingResult(response.data);
                setStep(3);
                toast.success('Booking confirmed successfully!');
            } else {
                toast.error(response.message || 'Booking failed');
                setError(response.message || 'Booking failed');
            }
        } catch (err) {
            const msg = err.message || 'Booking failed. Please try again.';
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedAddon = () => {
        return addons.find(a => (a.addonId || a.id) === selectedAddonId);
    };

    // Smart Pricing Logic
    const calculateDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateSmartPrice = () => {
        if (!pickupDate || !returnDate) return { total: 0, breakdown: '' };

        const totalDays = calculateDuration(pickupDate, returnDate);
        let remainingDays = totalDays;

        const months = Math.floor(remainingDays / 30);
        remainingDays = remainingDays % 30;

        const weeks = Math.floor(remainingDays / 7);
        remainingDays = remainingDays % 7;

        const days = remainingDays;

        const monthCost = months * monthlyRate;
        const weekCost = weeks * weeklyRate;
        const dayCost = days * dailyRate;

        const baseTotal = monthCost + weekCost + dayCost;

        const addon = getSelectedAddon();
        const addonCost = addon ? (parseFloat(addon.pricePerDay || addon.amount || 0) * totalDays) : 0;

        return {
            total: baseTotal + addonCost,
            baseTotal,
            addonCost,
            breakdown: { months, weeks, days, totalDays }
        };
    };

    const pricing = calculateSmartPrice();

    if (fetchingDetails) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Progress - Now 3 steps */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`flex-1 h-2 rounded-full transition ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between mb-6 text-xs text-gray-500">
                <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Addons</span>
                <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Details</span>
                <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>Confirm</span>
            </div>

            {/* Step 1: Addons Selection */}
            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Optional Addons</h2>
                            <p className="text-gray-500 mb-4">
                                Enhance your rental experience with these optional extras
                            </p>

                            {loadingAddons ? (
                                <div className="flex justify-center py-10">
                                    <Spinner />
                                </div>
                            ) : addons.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p>No addons available at the moment</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 mb-6">
                                    {addons.map((addon) => {
                                        const addonId = addon.addonId || addon.id;
                                        const isSelected = selectedAddonId === addonId;

                                        return (
                                            <div
                                                key={addonId}
                                                onClick={() => setSelectedAddonId(isSelected ? null : addonId)}
                                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-6 h-6 mt-1 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                            }`}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                                {addon.addonName || addon.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                {addon.description || 'Additional feature for your rental'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-gray-900 text-lg">
                                                            {formatCurrency(addon.pricePerDay || addon.amount || 0)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">per day</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex gap-4 mt-8">
                                <Button variant="outline" onClick={() => router.back()} className="flex-1">
                                    ← Back
                                </Button>
                                <Button onClick={() => setStep(2)} className="flex-1">
                                    {selectedAddonId ? 'Continue with Addon' : 'Skip & Continue'}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Booking Summary Sidebar (Smart Pricing) */}
                    <div>
                        <Card className="p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>

                            {/* Dates */}
                            <div className="space-y-3 mb-6 border-b pb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Pickup</p>
                                    <p className="font-medium text-gray-900">{pickupDate ? new Date(pickupDate).toLocaleDateString() : 'Select Date'}</p>
                                    {/* <p className="text-xs text-gray-500">{new Date(pickupDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p> */}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Return</p>
                                    <p className="font-medium text-gray-900">{returnDate ? new Date(returnDate).toLocaleDateString() : 'Select Date'}</p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-sm text-gray-600">Duration: <span className="font-semibold text-gray-900">{pricing.breakdown.totalDays} Days</span></p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 mb-6 border-b pb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Base Price</span>
                                    <span className="font-medium">{formatCurrency(pricing.baseTotal)}</span>
                                </div>
                                <div className="text-xs text-gray-400 pl-2 space-y-1">
                                    {pricing.breakdown.months > 0 && (
                                        <div className="flex justify-between">
                                            <span>{pricing.breakdown.months} Months x {formatCurrency(monthlyRate)}</span>
                                            <span>{formatCurrency(pricing.breakdown.months * monthlyRate)}</span>
                                        </div>
                                    )}
                                    {pricing.breakdown.weeks > 0 && (
                                        <div className="flex justify-between">
                                            <span>{pricing.breakdown.weeks} Weeks x {formatCurrency(weeklyRate)}</span>
                                            <span>{formatCurrency(pricing.breakdown.weeks * weeklyRate)}</span>
                                        </div>
                                    )}
                                    {pricing.breakdown.days > 0 && (
                                        <div className="flex justify-between">
                                            <span>{pricing.breakdown.days} Days x {formatCurrency(dailyRate)}</span>
                                            <span>{formatCurrency(pricing.breakdown.days * dailyRate)}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedAddonId && (
                                    <div className="flex justify-between text-sm text-blue-600 pt-2">
                                        <span>Addon (x{pricing.breakdown.totalDays} days)</span>
                                        <span className="font-medium">{formatCurrency(pricing.addonCost)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-900">Estimated Total</span>
                                <span className="font-bold text-2xl text-blue-600">{formatCurrency(pricing.total)}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                *Final price may vary based on return date and time
                            </p>
                        </Card>
                    </div>
                </div>
            )
            }

            {/* Step 2: Customer Details */}
            {
                step === 2 && (
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Details</h2>
                        <p className="text-gray-500 mb-6">
                            {user ? 'Review and update your details' : 'Fill in your details to complete booking'}
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Personal Info Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="First Name *"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={user?.role === 'customer'}
                                />
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={user?.role === 'customer'}
                                />
                                <Input
                                    label="Email *"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={user?.role === 'customer'}
                                />
                            </div>

                            {/* Contact & Address Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Mobile Number *"
                                    type="tel"
                                    name="phoneCell"
                                    value={formData.phoneCell}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    disabled={user?.role === 'customer'}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Location Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <select
                                        name="stateId"
                                        value={formData.stateId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state.stateId || state.id} value={state.stateId || state.id}>
                                                {state.stateName || state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <select
                                        name="cityId"
                                        value={formData.cityId}
                                        onChange={handleChange}
                                        disabled={!formData.stateId}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(city => (
                                            <option key={city.cityId || city.id} value={city.cityId || city.id}>
                                                {city.cityName || city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Zipcode"
                                    name="zipcode"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* License Details Section */}
                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Driving License Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="License Number *"
                                        name="drivingLicenseNo"
                                        value={formData.drivingLicenseNo}
                                        onChange={handleChange}
                                        placeholder="MH01-2020-1234567"
                                        disabled={user?.role === 'customer'}
                                    />
                                    <Input
                                        label="Valid Till *"
                                        type="date"
                                        name="licenseValidTill"
                                        value={formData.licenseValidTill}
                                        onChange={handleChange}
                                        disabled={user?.role === 'customer'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                ← Back
                            </Button>
                            <Button onClick={handleSubmit} loading={loading} className="flex-1">
                                Complete Booking
                            </Button>
                        </div>
                    </Card>
                )
            }

            {/* Step 3: Confirmation */}
            {
                step === 3 && bookingResult && (
                    <Card className="p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">✅</span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-8">Your booking has been successfully created.</p>

                        <div className="bg-blue-50 rounded-xl p-6 mb-8">
                            <p className="text-sm text-blue-600 mb-2">Booking ID</p>
                            <p className="text-4xl font-bold text-blue-700">#{bookingResult.bookingId}</p>
                        </div>

                        <div className="text-left bg-gray-50 rounded-xl p-6 mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Vehicle</p>
                                    <p className="font-medium">{bookingResult.vehicleName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Registration</p>
                                    <p className="font-medium">{bookingResult.vehicleRegistration}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pickup Hub</p>
                                    <p className="font-medium">{bookingResult.pickupHub}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Return Hub</p>
                                    <p className="font-medium">{bookingResult.returnHub}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pickup</p>
                                    <p className="font-medium">{new Date(bookingResult.pickupDatetime).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Return</p>
                                    <p className="font-medium">{new Date(bookingResult.returnDatetime).toLocaleString()}</p>
                                </div>
                                {selectedAddonId && getSelectedAddon() && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Addon</p>
                                        <p className="font-medium">{getSelectedAddon()?.addonName || getSelectedAddon()?.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            📧 A confirmation email has been sent to <strong>{bookingResult.email}</strong>
                        </p>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
                                Back to Home
                            </Button>
                            {user && (
                                <Button onClick={() => router.push('/my-bookings')} className="flex-1">
                                    View My Bookings
                                </Button>
                            )}
                        </div>
                    </Card>
                )
            }
        </div >
    );
}

export default function BookingPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <Suspense fallback={
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                }>
                    <BookingForm />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
