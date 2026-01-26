'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAvailableVehiclesByHub } from '../../services/catalogService';
import { getVehicleTypesWithRates } from '../../services/vehicleService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';

function VehiclesList() {
    const searchParams = useSearchParams();
    const pickupHub = searchParams.get('pickupHub');
    const returnHub = searchParams.get('returnHub');
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');

    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRate, setSelectedRate] = useState('daily');

    useEffect(() => {
        fetchVehicles();
    }, [pickupHub]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            // Fetch available vehicles by hub
            if (pickupHub) {
                const catalogResponse = await getAvailableVehiclesByHub(pickupHub);
                const vehicleData = Array.isArray(catalogResponse) ? catalogResponse : catalogResponse.data || [];
                setVehicles(vehicleData);
            }

            // Also fetch vehicle types with rates
            const typesResponse = await getVehicleTypesWithRates();
            const typesData = typesResponse.data || [];
            setVehicleTypes(typesData);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRateAmount = (item) => {
        if (selectedRate === 'daily') return item.dailyRate;
        if (selectedRate === 'weekly') return item.weeklyRate;
        if (selectedRate === 'monthly') return item.monthlyRate;
        return item.dailyRate;
    };

    const handleBook = (vehicleId, rateId) => {
        const params = new URLSearchParams({
            vehicleId: vehicleId.toString(),
            rateId: rateId?.toString() || '1',
            pickupHub: pickupHub || '',
            dropHub: returnHub || pickupHub || '',
            pickupDate: pickupDate || '',
            returnDate: returnDate || '',
        });
        window.location.href = `/booking?${params.toString()}`;
    };

    // Use vehicleTypes if available, otherwise show available vehicles
    const displayItems = vehicleTypes.length > 0 ? vehicleTypes : vehicles;

    return (
        <>
            {/* Header with Search Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Available Vehicles</h1>
                    {pickupDate && returnDate && (
                        <div className="flex flex-wrap gap-4 text-blue-100">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                📅 {new Date(pickupDate).toLocaleDateString()} - {new Date(returnDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Rate Filter */}
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">View rates:</span>
                        <div className="flex gap-2">
                            {['daily', 'weekly', 'monthly'].map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => setSelectedRate(rate)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition
                    ${selectedRate === rate
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {rate.charAt(0).toUpperCase() + rate.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-4">No vehicles available</p>
                        <Link href="/">
                            <Button variant="outline">Change Search</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayItems.map((item) => (
                            <Card key={item.vehicleTypeId || item.vehicleId || item.id} hover className="overflow-hidden">
                                {/* Image */}
                                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                                    {item.imgUrl ? (
                                        <img
                                            src={`http://localhost:8080${item.imgUrl}`}
                                            alt={item.typeName || item.vehicleName || 'Vehicle'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <span className="text-6xl">🚗</span>
                                    )}
                                </div>

                                <Card.Body>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {item.typeName || item.vehicleName || 'Vehicle'}
                                        </h3>
                                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                                            Available
                                        </span>
                                    </div>

                                    <p className="text-gray-500 text-sm mb-4">
                                        {item.description || item.vehicleRegistration || 'Quality vehicle for your journey'}
                                    </p>

                                    {/* All Rates Display */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className={`p-2 rounded ${selectedRate === 'daily' ? 'bg-blue-100' : ''}`}>
                                                <p className="text-xs text-gray-500">Daily</p>
                                                <p className="font-bold text-gray-900">{formatCurrency(item.dailyRate || 0)}</p>
                                            </div>
                                            <div className={`p-2 rounded ${selectedRate === 'weekly' ? 'bg-blue-100' : ''}`}>
                                                <p className="text-xs text-gray-500">Weekly</p>
                                                <p className="font-bold text-gray-900">{formatCurrency(item.weeklyRate || 0)}</p>
                                            </div>
                                            <div className={`p-2 rounded ${selectedRate === 'monthly' ? 'bg-blue-100' : ''}`}>
                                                <p className="text-xs text-gray-500">Monthly</p>
                                                <p className="font-bold text-gray-900">{formatCurrency(item.monthlyRate || 0)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={() => handleBook(item.vehicleTypeId || item.vehicleId || item.id, item.rateId)}
                                    >
                                        Book Now - {formatCurrency(getRateAmount(item))}/{selectedRate}
                                    </Button>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default function VehiclesPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <Suspense fallback={
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                }>
                    <VehiclesList />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
