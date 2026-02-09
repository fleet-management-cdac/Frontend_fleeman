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
                <div className="flex-1 flex items-center">
                    <p className="text-gray-900 font-medium">Date: <span className="font-normal text-gray-600">
                        {(() => {
                            const d = new Date();
                            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                        })()}
                    </span></p>
                </div>
                <Button onClick={handleReturn} disabled={processing} size="lg">
                    {processing ? 'Processing...' : 'Process Return'}
                </Button>
            </div>
        </Card>
    );
}
