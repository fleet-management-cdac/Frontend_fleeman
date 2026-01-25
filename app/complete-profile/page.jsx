'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getUserDetails } from '../../services/authService';
import { getAllStates, getCitiesByState } from '../../services/locationService';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

export default function CompleteProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, profileComplete, markProfileComplete } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        stateId: '',
        cityId: '',
        zipcode: '',
        phoneHome: '',
        phoneCell: '',
        dateOfBirth: '',
        isCitizen: true,
        drivingLicenseNo: '',
        licenseValidTill: '',
        passportNo: '',
        passportValidTill: '',
        dipNumber: '',
        dipValidTill: '',
    });

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [serverError, setServerError] = useState('');

    // Redirect if already complete
    useEffect(() => {
        if (!authLoading && profileComplete) {
            router.push('/dashboard');
        }
    }, [authLoading, profileComplete, router]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    // Fetch initial data
    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    // Fetch cities when state changes
    useEffect(() => {
        if (formData.stateId) {
            fetchCities(formData.stateId);
        }
    }, [formData.stateId]);

    const fetchInitialData = async () => {
        try {
            // Fetch states
            const statesResponse = await getAllStates();
            setStates(Array.isArray(statesResponse) ? statesResponse : statesResponse.data || []);

            // Fetch existing user details
            const userResponse = await getUserDetails(user.id);
            if (userResponse.success && userResponse.data) {
                const details = userResponse.data;
                setFormData(prev => ({
                    ...prev,
                    firstName: details.firstName || '',
                    lastName: details.lastName || '',
                    email: user.email || details.email || '',
                    address: details.address || '',
                    zipcode: details.zipcode || '',
                    phoneHome: details.phoneHome || '',
                    phoneCell: details.phoneCell || '',
                    dateOfBirth: details.dateOfBirth || '',
                    drivingLicenseNo: details.drivingLicenseNo || '',
                    licenseValidTill: details.licenseValidTill || '',
                }));
            } else {
                setFormData(prev => ({ ...prev, email: user.email }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setFormData(prev => ({ ...prev, email: user?.email || '' }));
        } finally {
            setFetchingData(false);
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setErrors({ ...errors, [name]: '' });
        setServerError('');

        if (name === 'stateId') {
            setFormData(prev => ({ ...prev, stateId: value, cityId: '' }));
            setCities([]);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.phoneCell) newErrors.phoneCell = 'Mobile number is required';

        if (formData.isCitizen) {
            if (!formData.drivingLicenseNo) newErrors.drivingLicenseNo = 'License number is required';
            if (!formData.licenseValidTill) newErrors.licenseValidTill = 'License validity is required';
        } else {
            if (!formData.passportNo) newErrors.passportNo = 'Passport number is required';
            if (!formData.passportValidTill) newErrors.passportValidTill = 'Passport validity is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setServerError('');

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName || null,
                address: formData.address || null,
                cityId: formData.cityId ? parseInt(formData.cityId) : null,
                zipcode: formData.zipcode || null,
                phoneHome: formData.phoneHome || null,
                phoneCell: formData.phoneCell,
                dateOfBirth: formData.dateOfBirth || null,
                drivingLicenseNo: formData.isCitizen ? formData.drivingLicenseNo : null,
                licenseValidTill: formData.isCitizen ? formData.licenseValidTill : null,
                passportNo: !formData.isCitizen ? formData.passportNo : null,
                passportValidTill: !formData.isCitizen ? formData.passportValidTill : null,
                dipNumber: !formData.isCitizen && formData.dipNumber ? parseInt(formData.dipNumber) : null,
                dipValidTill: !formData.isCitizen ? formData.dipValidTill : null,
            };

            const response = await api.put(`/api/users/details/${user.id}`, payload);

            if (response.data.success) {
                markProfileComplete();
                router.push('/dashboard');
            } else {
                setServerError(response.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || fetchingData) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    <Card className="p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">👋</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
                            <p className="text-gray-500 mt-2">
                                Please provide additional details to continue
                            </p>
                        </div>

                        {serverError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email - Read Only */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name *"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    error={errors.firstName}
                                />
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Mobile Number *"
                                    type="tel"
                                    name="phoneCell"
                                    value={formData.phoneCell}
                                    onChange={handleChange}
                                    error={errors.phoneCell}
                                    placeholder="9876543210"
                                />
                                <Input
                                    label="Home Phone"
                                    type="tel"
                                    name="phoneHome"
                                    value={formData.phoneHome}
                                    onChange={handleChange}
                                />
                            </div>

                            <Input
                                label="Date of Birth"
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />

                            <Input
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />

                            {/* State and City */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <select
                                        name="stateId"
                                        value={formData.stateId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(city => (
                                            <option key={city.cityId || city.id} value={city.cityId || city.id}>
                                                {city.cityName || city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Input
                                label="Zipcode"
                                name="zipcode"
                                value={formData.zipcode}
                                onChange={handleChange}
                            />

                            {/* Citizenship Checkbox */}
                            <div className="border-t border-b py-4 my-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isCitizen"
                                        checked={formData.isCitizen}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">I am a citizen of this country</span>
                                        <p className="text-sm text-gray-500">
                                            {formData.isCitizen
                                                ? 'Provide your driving license details'
                                                : 'Provide your passport and DIP details'}
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Conditional Document Fields */}
                            {formData.isCitizen ? (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="text-xl">🪪</span> Driving License Details
                                    </h3>
                                    <Input
                                        label="Driving License No. *"
                                        name="drivingLicenseNo"
                                        value={formData.drivingLicenseNo}
                                        onChange={handleChange}
                                        error={errors.drivingLicenseNo}
                                        placeholder="MH01-2020-1234567"
                                    />
                                    <Input
                                        label="License Valid Till *"
                                        type="date"
                                        name="licenseValidTill"
                                        value={formData.licenseValidTill}
                                        onChange={handleChange}
                                        error={errors.licenseValidTill}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="text-xl">🛂</span> Passport Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Passport No. *"
                                            name="passportNo"
                                            value={formData.passportNo}
                                            onChange={handleChange}
                                            error={errors.passportNo}
                                            placeholder="A12345678"
                                        />
                                        <Input
                                            label="Passport Valid Till *"
                                            type="date"
                                            name="passportValidTill"
                                            value={formData.passportValidTill}
                                            onChange={handleChange}
                                            error={errors.passportValidTill}
                                        />
                                    </div>

                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 pt-2">
                                        <span className="text-xl">📋</span> DIP (International Driving Permit)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="DIP Number"
                                            name="dipNumber"
                                            value={formData.dipNumber}
                                            onChange={handleChange}
                                            placeholder="Optional"
                                        />
                                        <Input
                                            label="DIP Valid Till"
                                            type="date"
                                            name="dipValidTill"
                                            value={formData.dipValidTill}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full mt-6" loading={loading}>
                                Complete Profile & Continue
                            </Button>
                        </form>
                    </Card>
                </div>
            </main>
        </>
    );
}
