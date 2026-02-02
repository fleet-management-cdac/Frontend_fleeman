'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/layout/Navbar';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Badge from '../../../components/ui/Badge';
import {
    getAllStates,
    getCitiesByState,
    getHubsByCity
} from '../../../services/locationService';

// Reusing the simple SelectBox style from standard select logic
// Since SelectBox is internal to HeroSection, defining a local accessible version here
function SelectBox({ name, value, onChange, disabled, options, placeholder, idKey, nameKey }) {
    return (
        <div className="relative">
            <select name={name} value={value} onChange={onChange} disabled={disabled}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-300 transition-all
                disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o[idKey] || o.id} value={o[idKey] || o.id}>{o[nameKey] || o.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
        </div>
    );
}

export default function StaffVehiclesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Check if user is admin (can see all hubs)
    const isAdmin = user?.role === 'admin';
    const staffHubId = user?.hubId;

    // Filters (only for admin)
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [hubs, setHubs] = useState([]);

    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedHub, setSelectedHub] = useState('');

    // Data
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch Inventory Logic
    const fetchInventory = async (hubId = null) => {
        setLoading(true);
        setError('');
        try {
            // If hubId is provided, fetch specific hub inventory
            // Otherwise fetch all inventory (admin only)
            const url = hubId
                ? `http://localhost:8080/api/inventory/hub/${hubId}`
                : `http://localhost:8080/api/inventory/all`;

            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setVehicles(Array.isArray(data) ? data : []);
            } else {
                setError('Failed to fetch inventory');
            }
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    // Initial Load - different behavior for admin vs staff
    useEffect(() => {
        if (authLoading) return;

        if (isAdmin) {
            // Admin: fetch all inventory initially
            fetchInventory();
            // Load states for filters
            const loadStates = async () => {
                try {
                    const res = await getAllStates();
                    setStates(Array.isArray(res) ? res : (res.data || []));
                } catch (err) {
                    console.error("Failed to load states", err);
                }
            };
            loadStates();
        } else if (staffHubId) {
            // Staff with hub: fetch only their hub's inventory
            fetchInventory(staffHubId);
        }
        // Staff without hub: show nothing (handled in UI)
    }, [authLoading, isAdmin, staffHubId]);

    // Load Cities when State changes (admin only)
    useEffect(() => {
        if (!isAdmin) return;
        if (selectedState) {
            const fetchCities = async () => {
                try {
                    const res = await getCitiesByState(selectedState);
                    setCities(Array.isArray(res) ? res : (res.data || []));
                    setSelectedCity('');
                    setHubs([]);
                    setSelectedHub('');
                } catch (err) {
                    console.error("Failed to load cities", err);
                }
            };
            fetchCities();
        } else {
            setCities([]);
            setHubs([]);
        }
    }, [selectedState, isAdmin]);

    // Load Hubs when City changes (admin only)
    useEffect(() => {
        if (!isAdmin) return;
        if (selectedCity) {
            const fetchHubs = async () => {
                try {
                    const res = await getHubsByCity(selectedCity);
                    setHubs(Array.isArray(res) ? res : (res.data || []));
                    setSelectedHub('');
                } catch (err) {
                    console.error("Failed to load hubs", err);
                }
            };
            fetchHubs();
        } else {
            setHubs([]);
        }
    }, [selectedCity, isAdmin]);

    // Fetch Inventory when Hub changes (admin only)
    useEffect(() => {
        if (!isAdmin) return;
        if (selectedHub) {
            fetchInventory(selectedHub);
        } else if (!selectedHub && !selectedCity && !selectedState) {
            fetchInventory(); // Back to all
        }
    }, [selectedHub, selectedCity, selectedState, isAdmin]);


    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available': return 'bg-green-100 text-green-700';
            case 'rented': return 'bg-blue-100 text-blue-700';
            case 'maintenance': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    // Staff without hub assigned
    if (!isAdmin && !staffHubId) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 pb-12">
                    <Navbar />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Card className="p-8 text-center">
                            <span className="text-4xl block mb-4">⚠️</span>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">No Hub Assigned</h2>
                            <p className="text-gray-500 mb-4">
                                You are not assigned to any hub. Please contact an administrator to assign you to a hub.
                            </p>
                            <Button onClick={() => router.push('/staff/dashboard')}>
                                Back to Dashboard
                            </Button>
                        </Card>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            {/* We might want a dedicated Staff Layout in future, but reusing Navbar/Footer for now as per dashboard */}
            <div className="min-h-screen bg-gray-50 pb-12">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h1>
                            <p className="text-gray-500 mt-1">Manage and view fleet status by location</p>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>
                            Back to Dashboard
                        </Button>
                    </div>

                    {/* Filters - Admin Only */}
                    {isAdmin ? (
                        <Card className="p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Select Location</h2>
                                {(selectedState || selectedCity || selectedHub) && (
                                    <button
                                        onClick={() => {
                                            setSelectedState('');
                                            setSelectedCity('');
                                            setSelectedHub('');
                                            setVehicles([]); // Clear first
                                            fetchInventory(); // Fetch all
                                        }}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SelectBox
                                    name="state"
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    options={states}
                                    placeholder="Select State"
                                    idKey="stateId"
                                    nameKey="stateName"
                                />
                                <SelectBox
                                    name="city"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    disabled={!selectedState}
                                    options={cities}
                                    placeholder="Select City"
                                    idKey="cityId"
                                    nameKey="cityName"
                                />
                                <SelectBox
                                    name="hub"
                                    value={selectedHub}
                                    onChange={(e) => setSelectedHub(e.target.value)}
                                    disabled={!selectedCity}
                                    options={hubs}
                                    placeholder="Select Hub"
                                    idKey="hubId"
                                    nameKey="hubName"
                                />
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-4 mb-8 bg-blue-50 border-blue-200">
                            <p className="text-blue-800 font-medium">
                                📍 Showing vehicles for your assigned hub only
                            </p>
                        </Card>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
                            {error}
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <span className="text-4xl block mb-2">🚗</span>
                            <p className="text-gray-500">No vehicles found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <h3 className="font-semibold text-gray-700"> Total Vehicles: {vehicles.length}</h3>
                                {selectedHub && <span className="text-sm text-gray-500">Showing inventory for selected hub</span>}
                                {!selectedHub && <span className="text-sm text-gray-500">Showing all inventory</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vehicles.map((vehicle) => (
                                    <div key={vehicle.vehicleId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{vehicle.company} {vehicle.model}</h3>
                                                    <p className="text-sm text-gray-500 font-mono">{vehicle.registrationNo}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(vehicle.status)}`}>
                                                    {vehicle.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex justify-between py-1 border-b border-gray-50">
                                                    <span>Type</span>
                                                    <span className="font-medium text-gray-900">{vehicle.vehicleTypeName}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-gray-50">
                                                    <span>Description</span>
                                                    <span className="font-medium text-gray-900">{vehicle.description}</span>
                                                </div>
                                                <div className="flex justify-between py-1 pt-2">
                                                    <span>Next Service</span>
                                                    <span className={new Date(vehicle.nextServiceDate) < new Date() ? "text-red-600 font-bold" : "text-gray-900 font-medium"}>
                                                        {new Date(vehicle.nextServiceDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                            <span>ID: {vehicle.vehicleId}</span>
                                            <span>{vehicle.hubName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

            </div>
        </>
    );
}
