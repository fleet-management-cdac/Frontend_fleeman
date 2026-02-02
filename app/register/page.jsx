'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as registerApi, googleLogin } from '../../services/authService';
import { getAllStates, getCitiesByState } from '../../services/locationService';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        address: '',
        stateId: '',
        cityId: '',
        zipcode: '',
        phoneHome: '',
        phoneCell: '',
        dateOfBirth: '',
        isCitizen: true, // Default to citizen
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
    const [serverError, setServerError] = useState('');

    // Fetch states on mount
    useEffect(() => {
        fetchStates();
    }, []);

    // Fetch cities when state changes
    useEffect(() => {
        if (formData.stateId) {
            fetchCities(formData.stateId);
        } else {
            setCities([]);
        }
    }, [formData.stateId]);

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setErrors({ ...errors, [name]: '' });
        setServerError('');

        // Reset city when state changes
        if (name === 'stateId') {
            setFormData(prev => ({ ...prev, stateId: value, cityId: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Password: At least 8 chars, 1 letter, 1 number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be at least 8 chars, include a letter and a number';
        }

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
        } else if (!/^[a-zA-Z\s]*$/.test(formData.firstName)) {
            newErrors.firstName = 'First name should only contain letters';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else {
            const dob = new Date(formData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (age < 18) {
                newErrors.dateOfBirth = 'You must be at least 18 years old';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        const mobileRegex = /^\d{10}$/;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.phoneCell) {
            newErrors.phoneCell = 'Mobile number is required';
        } else if (!mobileRegex.test(formData.phoneCell)) {
            newErrors.phoneCell = 'Mobile number must be 10 digits';
        }

        if (formData.zipcode && !/^\d{5,6}$/.test(formData.zipcode)) {
            newErrors.zipcode = 'Invalid zipcode'; // Basic length check
        }

        if (formData.isCitizen) {
            // Citizens need driving license
            if (!formData.drivingLicenseNo) newErrors.drivingLicenseNo = 'License number is required';
            if (!formData.licenseValidTill) {
                newErrors.licenseValidTill = 'License validity is required';
            } else if (new Date(formData.licenseValidTill) <= today) {
                newErrors.licenseValidTill = 'License must be valid (future date)';
            }
        } else {
            // Non-citizens need passport
            if (!formData.passportNo) newErrors.passportNo = 'Passport number is required';
            if (!formData.passportValidTill) {
                newErrors.passportValidTill = 'Passport validity is required';
            } else if (new Date(formData.passportValidTill) <= today) {
                newErrors.passportValidTill = 'Passport must be valid (future date)';
            }

            // DIP validity check if provided
            if (formData.dipValidTill && new Date(formData.dipValidTill) <= today) {
                newErrors.dipValidTill = 'DIP must be valid (future date)';
            }
        }

        setErrors(newErrors);

        // Show errors in toast if any specific ones need attention, or just let UI handle it
        if (Object.keys(newErrors).length > 0) {
            // Optional: toast.error("Please fix the errors in the form");
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setLoading(true);
        setServerError('');

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName || null,
                address: formData.address || null,
                cityId: formData.cityId ? parseInt(formData.cityId) : null,
                zipcode: formData.zipcode || null,
                phoneHome: formData.phoneHome || null,
                phoneCell: formData.phoneCell,
                dateOfBirth: formData.dateOfBirth || null,
                // Document details based on citizenship
                drivingLicenseNo: formData.isCitizen ? formData.drivingLicenseNo : null,
                licenseValidTill: formData.isCitizen ? formData.licenseValidTill : null,
                passportNo: !formData.isCitizen ? formData.passportNo : null,
                passportValidTill: !formData.isCitizen ? formData.passportValidTill : null,
                dipNumber: !formData.isCitizen && formData.dipNumber ? parseInt(formData.dipNumber) : null,
                dipValidTill: !formData.isCitizen ? formData.dipValidTill : null,
            };

            const response = await registerApi(payload);

            if (response.success) {
                toast.success('Registration successful! Redirecting to login...', {
                    onClose: () => router.push('/login?registered=true')
                });
                // Fallback redirect in case onClose doesn't trigger immediately or if user navigates away
                setTimeout(() => {
                    router.push('/login?registered=true');
                }, 3000);
            } else {
                const msg = response.message || 'Registration failed';
                setServerError(msg);
                toast.error(msg);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setServerError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-2">
            <div className="w-full max-w-lg">
                <div className="text-center mb-2 flex flex-col items-center">
                    <Link href="/" className="inline-block transition-transform hover:scale-105">
                        <img
                            src="/brandlogo.png"
                            alt="FLEEMAN"
                            className="h-20 w-auto object-contain"
                        />
                    </Link>
                </div>

                <Card className="p-8">
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Create Account</h1>
                    <p className="text-gray-500 text-center mb-6">Step {step} of 2</p>

                    {/* Progress Indicator */}
                    <div className="flex gap-2 mb-8">
                        <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    </div>

                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{serverError}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
                                    <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                                </div>
                                <Input label="Email *" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
                                <Input label="Password *" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} />
                                <Input label="Confirm Password *" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                                <Input label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} />
                                <Button type="button" className="w-full" onClick={handleNext}>Next Step</Button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Mobile Number *" type="tel" name="phoneCell" value={formData.phoneCell} onChange={handleChange} error={errors.phoneCell} placeholder="9876543210" />
                                    <Input label="Home Phone" type="tel" name="phoneHome" value={formData.phoneHome} onChange={handleChange} />
                                </div>

                                <Input label="Address" name="address" value={formData.address} onChange={handleChange} />

                                {/* State and City Dropdowns */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <select
                                            name="stateId"
                                            value={formData.stateId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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

                                <Input label="Zipcode" name="zipcode" value={formData.zipcode} onChange={handleChange} error={errors.zipcode} />

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
                                    // Citizen - Show Driving License fields
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
                                    // Non-Citizen - Show Passport and DIP fields
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
                                                error={errors.dipValidTill}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                                    <Button type="submit" className="flex-1" loading={loading}>Create Account</Button>
                                </div>
                            </>
                        )}
                    </form>

                    {step === 1 && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Or sign up with</span></div>
                            </div>
                            <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-3" onClick={googleLogin}>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </Button>
                        </>
                    )}

                    <p className="text-center text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
                    </p>
                </Card>

                <p className="text-center text-gray-400 text-sm mt-6">
                    <Link href="/" className="hover:text-gray-600">← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}
