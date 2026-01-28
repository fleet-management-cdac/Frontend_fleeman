'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getUserDetails } from '../../services/authService';
import { getAllStates, getCitiesByState } from '../../services/locationService';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
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

    const [originalData, setOriginalData] = useState({});
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

            // Fetch user details
            const userResponse = await getUserDetails(user.id);
            if (userResponse.success && userResponse.data) {
                const details = userResponse.data;
                const data = {
                    firstName: details.firstName || '',
                    lastName: details.lastName || '',
                    email: user.email || details.email || '',
                    address: details.address || '',
                    stateId: '',
                    cityId: '',
                    zipcode: details.zipcode || '',
                    phoneHome: details.phoneHome || '',
                    phoneCell: details.phoneCell || '',
                    dateOfBirth: details.dateOfBirth || '',
                    isCitizen: !details.passportNo,
                    drivingLicenseNo: details.drivingLicenseNo || '',
                    licenseValidTill: details.licenseValidTill || '',
                    passportNo: details.passportNo || '',
                    passportValidTill: details.passportValidTill || '',
                    dipNumber: details.dipNumber || '',
                    dipValidTill: details.dipValidTill || '',
                    cityName: details.cityName || '',
                    stateName: details.stateName || '',
                };
                setFormData(data);
                setOriginalData(data);
            } else {
                setFormData(prev => ({ ...prev, email: user.email }));
                setOriginalData({ email: user.email });
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
        setSuccessMessage('');

        if (name === 'stateId') {
            setFormData(prev => ({ ...prev, stateId: value, cityId: '' }));
            setCities([]);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.phoneCell) newErrors.phoneCell = 'Mobile number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setServerError('');
        setSuccessMessage('');

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
                setSuccessMessage('Profile updated successfully!');
                setIsEditing(false);
                fetchInitialData(); // Refresh data
            } else {
                setServerError(response.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
        setErrors({});
        setServerError('');
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
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-gray-500 mt-1">View and manage your account details</p>
                        </div>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {/* Messages */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <span className="text-lg">✅</span> {successMessage}
                        </div>
                    )}
                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {serverError}
                        </div>
                    )}

                    <Card className="p-6">
                        <form onSubmit={handleSubmit}>
                            {/* Account Info */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>👤</span> Account Information
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <input
                                            type="text"
                                            value={user?.role || 'Customer'}
                                            disabled
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed capitalize"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📋</span> Personal Information
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name *"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        error={errors.firstName}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Mobile Number *"
                                        type="tel"
                                        name="phoneCell"
                                        value={formData.phoneCell}
                                        onChange={handleChange}
                                        error={errors.phoneCell}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Home Phone"
                                        type="tel"
                                        name="phoneHome"
                                        value={formData.phoneHome}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Date of Birth"
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {/* Address Info */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📍</span> Address
                                </h2>
                                <div className="space-y-4">
                                    <Input
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {isEditing ? (
                                            <>
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
                                            </>
                                        ) : (
                                            <>
                                                <Input
                                                    label="State"
                                                    value={formData.stateName || '-'}
                                                    disabled
                                                />
                                                <Input
                                                    label="City"
                                                    value={formData.cityName || '-'}
                                                    disabled
                                                />
                                            </>
                                        )}
                                        <Input
                                            label="Zipcode"
                                            name="zipcode"
                                            value={formData.zipcode}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Document Info */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>🪪</span> Identity Documents
                                </h2>

                                {isEditing && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
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
                                                        ? 'Using driving license'
                                                        : 'Using passport and DIP'}
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {formData.isCitizen ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="Driving License No."
                                            name="drivingLicenseNo"
                                            value={formData.drivingLicenseNo}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                        <Input
                                            label="License Valid Till"
                                            type="date"
                                            name="licenseValidTill"
                                            value={formData.licenseValidTill}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                label="Passport No."
                                                name="passportNo"
                                                value={formData.passportNo}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                            <Input
                                                label="Passport Valid Till"
                                                type="date"
                                                name="passportValidTill"
                                                value={formData.passportValidTill}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                label="DIP Number"
                                                name="dipNumber"
                                                value={formData.dipNumber}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                            <Input
                                                label="DIP Valid Till"
                                                type="date"
                                                name="dipValidTill"
                                                value={formData.dipValidTill}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-4 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        loading={loading}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Card>

                    {/* Back to Dashboard */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
