import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { formatDateTime } from '../../../lib/utils';

export default function HandoverForm({
    booking,
    bookingId,
    selectedVehicle,
    setSelectedVehicle,
    setStep,
    fuelStatus,
    setFuelStatus,
    handleCompleteHandover,
    processing
}) {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Handover Form</h2>
                    <Button variant="ghost" onClick={() => { setSelectedVehicle(null); setStep(2); }}>← Change Vehicle</Button>
                </div>

                <div className="space-y-4">
                    {/* Selected Vehicle */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Selected Vehicle</p>
                        <p className="font-bold text-lg text-green-700">{selectedVehicle.company} {selectedVehicle.model}</p>
                        <p className="font-medium">{selectedVehicle.registrationNo}</p>
                    </div>

                    {/* Fuel Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Status at Handover *</label>
                        <select
                            value={fuelStatus}
                            onChange={(e) => setFuelStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="full">Full Tank</option>
                            <option value="3/4">3/4 Tank</option>
                            <option value="1/2">Half Tank</option>
                            <option value="1/4">1/4 Tank</option>
                            <option value="empty">Empty</option>
                        </select>
                    </div>

                    <Button
                        onClick={handleCompleteHandover}
                        disabled={processing}
                        className="w-full"
                        size="lg"
                    >
                        {processing ? 'Processing...' : '🔑 Complete Handover'}
                    </Button>
                </div>
            </Card>

            {/* Summary */}
            <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Handover Summary</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Booking ID</span>
                        <span className="font-medium">#{bookingId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Customer</span>
                        <span className="font-medium">{booking?.firstName} {booking?.lastName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium">{booking?.phoneCell}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Vehicle</span>
                        <span className="font-medium">{selectedVehicle.company} {selectedVehicle.model}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Registration</span>
                        <span className="font-medium">{selectedVehicle.registrationNo}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Pickup Hub</span>
                        <span className="font-medium">{booking?.pickupHub}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Pickup Time</span>
                        <span className="font-medium">{formatDateTime(booking?.pickupDatetime)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">Return Time</span>
                        <span className="font-medium">{formatDateTime(booking?.returnDatetime)}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
