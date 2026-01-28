import Card from '../../ui/Card';
import Button from '../../ui/Button';

export default function ReturnSection({
    returnDate,
    setReturnDate,
    handleReturn,
    processing
}) {
    return (
        <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚗 Return Vehicle</h3>
            <p className="text-sm text-gray-600 mb-4">Vehicle is currently with customer. Process return when they bring it back.</p>

            <div className="flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Return Date</label>
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <Button onClick={handleReturn} disabled={processing} size="lg">
                    {processing ? 'Processing...' : '📋 Generate Invoice'}
                </Button>
            </div>
        </Card>
    );
}
