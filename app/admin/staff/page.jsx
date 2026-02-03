'use client';

import { useEffect, useState } from 'react';
import { createStaff, getAllStaff, assignHubToStaff, deleteStaff } from '../../../services/adminService';
import { getAllStates, getCitiesByState, getHubsByCity } from '../../../services/locationService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Spinner from '../../../components/ui/Spinner';

export default function StaffManagementPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHubModal, setShowHubModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Add staff form
    const [newStaff, setNewStaff] = useState({
        email: '', password: '', firstName: '', lastName: '', phoneCell: '', hubId: null
    });

    // Hub assignment
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedHub, setSelectedHub] = useState('');

    useEffect(() => {
        fetchStaff();
        fetchStates();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await getAllStaff();
            if (response.success) {
                setStaff(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            setMessage({ type: 'error', text: 'Failed to load staff list' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStates = async () => {
        try {
            const response = await getAllStates();
            // Location API returns array directly, not wrapped in {success, data}
            if (Array.isArray(response)) {
                setStates(response);
            } else if (response.success) {
                setStates(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const handleStateChange = async (stateId) => {
        setSelectedState(stateId);
        setSelectedCity('');
        setSelectedHub('');
        setCities([]);
        setHubs([]);
        if (stateId) {
            try {
                const response = await getCitiesByState(stateId);
                // Location API returns array directly
                if (Array.isArray(response)) {
                    setCities(response);
                } else if (response.success) {
                    setCities(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        }
    };

    const handleCityChange = async (cityId) => {
        setSelectedCity(cityId);
        setSelectedHub('');
        setHubs([]);
        if (cityId) {
            try {
                const response = await getHubsByCity(cityId);
                // Location API returns array directly
                if (Array.isArray(response)) {
                    setHubs(response);
                } else if (response.success) {
                    setHubs(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching hubs:', error);
            }
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await createStaff(newStaff);
            if (response.success) {
                setMessage({ type: 'success', text: 'Staff created successfully!' });
                setShowAddModal(false);
                setNewStaff({ email: '', password: '', firstName: '', lastName: '', phoneCell: '', hubId: null });
                fetchStaff();
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to create staff' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create staff' });
        } finally {
            setProcessing(false);
        }
    };

    const handleAssignHub = async () => {
        if (!selectedStaff || !selectedHub) return;
        setProcessing(true);

        try {
            const response = await assignHubToStaff(selectedStaff.userId, parseInt(selectedHub));
            if (response.success) {
                setMessage({ type: 'success', text: 'Hub assigned successfully!' });
                setShowHubModal(false);
                setSelectedStaff(null);
                fetchStaff();
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to assign hub' });
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteStaff = async (userId) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;

        try {
            const response = await deleteStaff(userId);
            if (response.success) {
                setMessage({ type: 'success', text: 'Staff deleted successfully!' });
                fetchStaff();
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete staff' });
        }
    };

    const openHubModal = (staffMember) => {
        setSelectedStaff(staffMember);
        setSelectedState('');
        setSelectedCity('');
        setSelectedHub('');
        setCities([]);
        setHubs([]);
        setShowHubModal(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">👥 Staff Management</h1>
                    <p className="text-gray-500">{staff.length} staff members</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>+ Add Staff</Button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Staff Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staff.map((member) => (
                                <tr key={member.userId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {member.firstName} {member.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{member.email}</td>
                                    <td className="px-6 py-4 text-gray-500">{member.phoneCell || '-'}</td>
                                    <td className="px-6 py-4">
                                        {member.hubName ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                                {member.hubName}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">
                                                Not Assigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => openHubModal(member)}>
                                                🏢 Assign Hub
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteStaff(member.userId)}>
                                                🗑️ Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {staff.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No staff members found</div>
                    )}
                </div>
            </Card>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Staff</h2>
                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                required
                                value={newStaff.email}
                                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                            />
                            <Input
                                label="Password"
                                type="password"
                                required
                                minLength={6}
                                value={newStaff.password}
                                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    required
                                    value={newStaff.firstName}
                                    onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                                />
                                <Input
                                    label="Last Name"
                                    value={newStaff.lastName}
                                    onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Phone"
                                value={newStaff.phoneCell}
                                onChange={(e) => setNewStaff({ ...newStaff, phoneCell: e.target.value })}
                            />
                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing ? 'Creating...' : 'Create Staff'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Assign Hub Modal */}
            {showHubModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-2">Assign Hub</h2>
                        <p className="text-gray-500 mb-4">
                            Assigning hub to: <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => handleStateChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select State</option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.id}>{state.stateName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    disabled={!selectedState}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                >
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>{city.name || city.cityName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hub</label>
                                <select
                                    value={selectedHub}
                                    onChange={(e) => setSelectedHub(e.target.value)}
                                    disabled={!selectedCity}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                >
                                    <option value="">Select Hub</option>
                                    {hubs.map((hub) => (
                                        <option key={hub.id} value={hub.id}>{hub.name || hub.hubName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowHubModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAssignHub} disabled={!selectedHub || processing} className="flex-1">
                                    {processing ? 'Assigning...' : 'Assign Hub'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
