import Card from '../../ui/Card';
import { formatDateTime } from '../../../lib/utils';

export default function BookingDetails({ booking }) {
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Customer Info */}
            <Card className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">👤 Customer Details</h2>
                <div className="space-y-3 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="font-medium">{booking?.firstName} {booking?.lastName}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium">{booking?.email}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{booking?.phoneCell || 'N/A'}</span></div>
                    <div><span className="text-gray-500">License:</span> <span className="font-medium">{booking?.drivingLicenseNo || 'N/A'}</span></div>
                </div>
            </Card>

            {/* Booking Info */}
            <Card className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">📋 Booking Details</h2>
                <div className="space-y-3 text-sm">
                    <div><span className="text-gray-500">Vehicle Type:</span> <span className="font-medium text-blue-600">{booking?.vehicleTypeName || 'N/A'}</span></div>
                    <div><span className="text-gray-500">Rate Plan:</span> <span className="font-medium">{booking?.ratePlan || 'Daily'}</span></div>
                    <div><span className="text-gray-500">Created:</span> <span className="font-medium">{formatDateTime(booking?.createdAt)}</span></div>
                </div>
            </Card>

            {/* Pickup/Return Info */}
            <Card className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">📍 Location & Time</h2>
                <div className="space-y-3 text-sm">
                    <div><span className="text-gray-500">Pickup Hub:</span> <span className="font-medium">{booking?.pickupHub}</span></div>
                    <div><span className="text-gray-500">Pickup Time:</span> <span className="font-medium">{formatDateTime(booking?.pickupDatetime)}</span></div>
                    <div><span className="text-gray-500">Return Hub:</span> <span className="font-medium">{booking?.returnHub}</span></div>
                    <div><span className="text-gray-500">Return Time:</span> <span className="font-medium">{formatDateTime(booking?.returnDatetime)}</span></div>
                </div>
            </Card>
        </div>
    );
}
