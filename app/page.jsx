'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getAllStates, getCitiesByState, getHubsByCity } from '../services/locationService';

export default function Home() {
    const router = useRouter();
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [formData, setFormData] = useState({
        stateId: '',
        cityId: '',
        pickupHubId: '',
        dropHubId: '',
        pickupDate: '',
        pickupTime: '10:00',
        returnDate: '',
        returnTime: '10:00',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStates();
    }, []);

    useEffect(() => {
        if (formData.stateId) {
            fetchCities(formData.stateId);
        }
    }, [formData.stateId]);

    useEffect(() => {
        if (formData.cityId) {
            fetchHubs(formData.cityId);
        }
    }, [formData.cityId]);

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

    const fetchHubs = async (cityId) => {
        try {
            const response = await getHubsByCity(cityId);
            setHubs(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Error fetching hubs:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset dependent fields
        if (name === 'stateId') {
            setFormData(prev => ({ ...prev, cityId: '', pickupHubId: '', dropHubId: '' }));
            setCities([]);
            setHubs([]);
        }
        if (name === 'cityId') {
            setFormData(prev => ({ ...prev, pickupHubId: '', dropHubId: '' }));
            setHubs([]);
        }
    };

    const handleSearch = () => {
        if (!formData.pickupHubId || !formData.pickupDate || !formData.returnDate) {
            alert('Please select pickup location and dates');
            return;
        }

        // Navigate to vehicles page with search params
        const params = new URLSearchParams({
            pickupHub: formData.pickupHubId,
            dropHub: formData.dropHubId || formData.pickupHubId,
            pickupDate: `${formData.pickupDate}T${formData.pickupTime}`,
            returnDate: `${formData.returnDate}T${formData.returnTime}`,
        });
        router.push(`/vehicles?${params.toString()}`);
    };

    // Get tomorrow's date for min date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <>
            <Navbar />

            {/* Hero Section with Search */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white min-h-[600px]">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Hero Text */}
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                Premium Vehicle Rentals
                                <span className="block text-blue-200">Made Simple</span>
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
                                Experience hassle-free car rentals across India. From economy to luxury,
                                we have the perfect vehicle for every journey.
                            </p>
                        </div>

                        {/* Right - Search Form */}
                        <Card className="p-6 bg-white/95 backdrop-blur text-gray-900">
                            <h2 className="text-xl font-bold mb-6 text-gray-900">Find Your Perfect Ride</h2>

                            <div className="space-y-4">
                                {/* State Selection */}
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

                                {/* City Selection */}
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

                                {/* Pickup Hub */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                                    <select
                                        name="pickupHubId"
                                        value={formData.pickupHubId}
                                        onChange={handleChange}
                                        disabled={!formData.cityId}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="">Select Pickup Hub</option>
                                        {hubs.map(hub => (
                                            <option key={hub.hubId || hub.id} value={hub.hubId || hub.id}>
                                                {hub.hubName || hub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Drop Hub */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Drop Location</label>
                                    <select
                                        name="dropHubId"
                                        value={formData.dropHubId}
                                        onChange={handleChange}
                                        disabled={!formData.cityId}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="">Same as Pickup</option>
                                        {hubs.map(hub => (
                                            <option key={hub.hubId || hub.id} value={hub.hubId || hub.id}>
                                                {hub.hubName || hub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date & Time Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                                        <input
                                            type="date"
                                            name="pickupDate"
                                            value={formData.pickupDate}
                                            onChange={handleChange}
                                            min={minDate}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            name="pickupTime"
                                            value={formData.pickupTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                                        <input
                                            type="date"
                                            name="returnDate"
                                            value={formData.returnDate}
                                            onChange={handleChange}
                                            min={formData.pickupDate || minDate}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            name="returnTime"
                                            value={formData.returnTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSearch} className="w-full" size="lg">
                                    Search Available Vehicles
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose FLEMAN?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">We provide the best vehicle rental experience with transparent pricing.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparent Pricing</h3>
                            <p className="text-gray-600">No hidden charges. Daily, weekly, and monthly rates clearly displayed.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">✅</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Booking</h3>
                            <p className="text-gray-600">Book your vehicle in minutes with instant confirmation.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">📍</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiple Locations</h3>
                            <p className="text-gray-600">Pick up and drop off at any of our hubs across major cities.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Hit the Road?</h2>
                    <p className="text-gray-300 text-lg mb-8">Join thousands of happy customers who trust FLEMAN.</p>
                    <Link href="/register">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Create Free Account</Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </>
    );
}
