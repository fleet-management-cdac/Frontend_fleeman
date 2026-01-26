'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAvailableVehiclesByHub } from '../../services/catalogService';
import { getVehicleTypesWithRates } from '../../services/vehicleService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';

function VehiclesList() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const pickupHub = searchParams.get('pickupHub');
    const dropHub = searchParams.get('dropHub');
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');

    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFleet, setSelectedFleet] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, [pickupHub]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            if (pickupHub) {
                const catalogResponse = await getAvailableVehiclesByHub(pickupHub);
                const vehicleData = Array.isArray(catalogResponse)
                    ? catalogResponse
                    : catalogResponse.data || [];
                setVehicles(vehicleData);
            }

            const typesResponse = await getVehicleTypesWithRates();
            setVehicleTypes(typesResponse.data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayItems = vehicleTypes.length > 0 ? vehicleTypes : vehicles;

    const handleContinue = () => {
        if (!selectedFleet) return;

        const params = new URLSearchParams({
            vehicleId: selectedFleet.toString(),
            pickupHub: pickupHub || '',
            dropHub: dropHub || pickupHub || '',
            pickupDate: pickupDate || '',
            returnDate: returnDate || '',
        });

        router.push(`/booking?${params.toString()}`);
    };

    return (
        <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">
                        Select Your Fleet
                    </h1>
                    {pickupDate && returnDate && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                            📅 {new Date(pickupDate).toLocaleDateString()} -{' '}
                            {new Date(returnDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Fleet Selection */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-4">
                            No vehicles available
                        </p>
                        <Link href="/">
                            <Button variant="outline">Change Search</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {displayItems.map((item) => {
                            const id = item.vehicleTypeId || item.vehicleId || item.id;
                            const isSelected = selectedFleet === id;

                            return (
                                <label
                                    key={id}
                                    className={`cursor-pointer border rounded-xl p-5 transition-all
                                    ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="fleet"
                                        value={id}
                                        checked={isSelected}
                                        onChange={() => setSelectedFleet(id)}
                                        className="hidden"
                                    />

                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Image */}
                                        <div className="w-full md:w-1/3 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                            {item.imgUrl ? (
                                                <img
                                                    src={`http://localhost:8080${item.imgUrl}`}
                                                    alt={item.typeName}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-6xl">🚗</span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">
                                                {item.typeName || item.vehicleName}
                                            </h3>
                                            <p className="text-gray-500 mb-3">
                                                {item.description || 'Comfortable and reliable vehicle'}
                                            </p>

                                            <div className="flex gap-6 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Daily</p>
                                                    <p className="font-bold">
                                                        {formatCurrency(item.dailyRate || 0)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Weekly</p>
                                                    <p className="font-bold">
                                                        {formatCurrency(item.weeklyRate || 0)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Monthly</p>
                                                    <p className="font-bold">
                                                        {formatCurrency(item.monthlyRate || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Buttons */}
                <div className="flex justify-between items-center mt-12">
                    <Button variant="outline" onClick={() => router.back()}>
                        ⬅ Back
                    </Button>

                    <Button
                        disabled={!selectedFleet}
                        onClick={handleContinue}
                        className="px-8"
                    >
                        Continue Booking →
                    </Button>
                </div>
            </div>
        </>
    );
}

export default function VehiclesPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <Suspense
                    fallback={
                        <div className="flex justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    }
                >
                    <VehiclesList />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
