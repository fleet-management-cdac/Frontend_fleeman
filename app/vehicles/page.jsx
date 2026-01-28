'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAvailableVehiclesByHub } from '../../services/catalogService';
import { getVehicleTypesWithRates } from '../../services/vehicleService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-toastify';

function VehiclesList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pickupHub = searchParams.get('pickupHub');
    const returnHub = searchParams.get('returnHub');
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');

    // Redirect if missing search params
    useEffect(() => {
        if (!pickupHub && !searchParams.get('vehicleId')) { // Allow direct vehicle link if ID is present, otherwise require search
            if (!pickupDate || !returnDate) {
                router.push('/?error=missing_location');
            }
        }
    }, [pickupHub, pickupDate, returnDate, router, searchParams]);

    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);

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
            toast.error("Failed to load vehicle rates. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (vehicle) => {
        const params = new URLSearchParams({
            vehicleId: (vehicle.vehicleTypeId || vehicle.vehicleId || vehicle.id).toString(),
            rateId: vehicle.rateId?.toString() || '1',
            pickupHub: pickupHub || '',
            dropHub: returnHub || pickupHub || '',
            pickupDate: pickupDate || '',
            returnDate: returnDate || '',
            dailyRate: (vehicle.dailyRate || 0).toString(),
            weeklyRate: (vehicle.weeklyRate || 0).toString(),
            monthlyRate: (vehicle.monthlyRate || 0).toString(),
            // Pass the vehicle name/type for better UX until fetched
            vehicleName: vehicle.typeName || vehicle.vehicleName || '',
        });
        window.location.href = `/booking?${params.toString()}`;
    };

    // Use vehicleTypes if available, otherwise show available vehicles
    const displayItems = vehicleTypes.length > 0 ? vehicleTypes : vehicles;

    return (
        <>
            {/* Header with Search Summary */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Select Your Car</h1>
                            {pickupDate && returnDate && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(pickupDate).toLocaleDateString()} - {new Date(returnDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Comparing 3 Rates</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg mb-6">No vehicles available for this selection.</p>
                        <Link href="/">
                            <Button>Change Search Criteria</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {displayItems.map((item) => (
                            <div key={item.vehicleTypeId || item.vehicleId || item.id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row">

                                {/* Image Section (Left) */}
                                <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 relative p-6 flex items-center justify-center">
                                    <div className="absolute top-4 left-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                        Available
                                    </div>
                                    <div className="h-40 w-full flex items-center justify-center">
                                        {item.imgUrl ? (
                                            <img
                                                src={`http://localhost:8080${item.imgUrl}`}
                                                alt={item.typeName || item.vehicleName || 'Vehicle'}
                                                className="max-w-full max-h-full object-contain drop-shadow-lg transform transition-transform hover:scale-110 duration-500"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <span className="text-6xl">🚗</span>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section (Right) */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 mb-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {item.typeName || item.vehicleName || 'Vehicle'}
                                            </h3>
                                            <p className="text-gray-500 text-xs max-w-md line-clamp-2">
                                                {item.description || item.vehicleRegistration || 'Premium driving experience with top-tier comfort and performance.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Comparison Table */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-gray-50/50 rounded-xl p-2 border border-gray-100">
                                        {/* Daily */}
                                        <div className="flex flex-col items-center justify-center p-2 border-r border-gray-200 last:border-0">
                                            <span className="text-xs text-gray-400 font-semibold uppercase">Daily</span>
                                            <span className="text-lg font-bold text-gray-900">{formatCurrency(item.dailyRate || 0)}</span>
                                        </div>

                                        {/* Weekly */}
                                        <div className="flex flex-col items-center justify-center p-2 border-r border-gray-200 last:border-0 relative">
                                            {/* Savings tag example */}
                                            {(item.weeklyRate / 7) < item.dailyRate && (
                                                <span className="absolute -top-3 bg-blue-100 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded">Save {(item.dailyRate - (item.weeklyRate / 7)).toFixed(0)}/day</span>
                                            )}
                                            <span className="text-xs text-gray-400 font-semibold uppercase">Weekly</span>
                                            <span className="text-lg font-bold text-gray-900">{formatCurrency(item.weeklyRate || 0)}</span>
                                        </div>

                                        {/* Monthly */}
                                        <div className="flex flex-col items-center justify-center p-2 border-r border-gray-200 last:border-0 md:border-none">
                                            <span className="text-xs text-gray-400 font-semibold uppercase">Monthly</span>
                                            <span className="text-lg font-bold text-gray-900">{formatCurrency(item.monthlyRate || 0)}</span>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center justify-center pl-2 pt-2 md:pt-0">
                                            <Button
                                                onClick={() => handleBook(item)}
                                                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2 text-sm rounded-lg shadow-md"
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
            <main className="min-h-screen bg-gray-50 pt-16 md:pt-0">
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
