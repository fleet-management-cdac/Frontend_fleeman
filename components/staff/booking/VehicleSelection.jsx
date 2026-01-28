import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

export default function VehicleSelection({
    booking,
    availableVehicles,
    vehicleSearch,
    setVehicleSearch,
    handleSelectVehicle,
    setStep
}) {
    const filteredVehicles = availableVehicles.filter(v => {
        if (!vehicleSearch.trim()) return true;
        const query = vehicleSearch.toLowerCase();
        return (
            (v.company || '').toLowerCase().includes(query) ||
            (v.model || '').toLowerCase().includes(query) ||
            (v.registrationNo || '').toLowerCase().includes(query)
        );
    });

    return (
        <Card>
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Select Vehicle for Handover</h2>
                        <p className="text-sm text-gray-500">
                            Showing available <strong className="text-blue-600">{booking?.vehicleTypeName || 'vehicles'}</strong> at <strong>{booking?.pickupHub}</strong>
                        </p>
                    </div>
                    <Button variant="ghost" onClick={() => setStep(1)}>← Back to Details</Button>
                </div>
                <input
                    type="text"
                    placeholder="🔍 Search vehicles..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {filteredVehicles.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No available vehicles found at this hub</div>
                ) : (
                    filteredVehicles.map((vehicle) => (
                        <div
                            key={vehicle.vehicleId}
                            onClick={() => handleSelectVehicle(vehicle)}
                            className="p-4 cursor-pointer hover:bg-green-50 transition flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-gray-900">{vehicle.company} {vehicle.model}</p>
                                <p className="text-sm text-gray-500">{vehicle.registrationNo}</p>
                                <p className="text-xs text-gray-400">{vehicle.vehicleTypeName}</p>
                            </div>
                            <Badge status="available">Available</Badge>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
