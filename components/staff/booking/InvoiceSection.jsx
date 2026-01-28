import { useRouter } from 'next/navigation';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { formatCurrency } from '../../../lib/utils';

export default function InvoiceSection({
    invoice,
    paymentSuccess,
    transactionId,
    handlePayment,
    processing
}) {
    const router = useRouter();

    return (
        <Card className="mt-6 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">📋 Invoice #{invoice.invoiceId}</h3>
                <Badge status="completed" className="text-lg px-4 py-2">Generated</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Customer & Vehicle Info */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Customer</span>
                        <span className="font-medium">{invoice.customerName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Vehicle</span>
                        <span className="font-medium">{invoice.vehicleName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Registration</span>
                        <span className="font-medium">{invoice.vehicleRegistration}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Handover Date</span>
                        <span className="font-medium">{invoice.handoverDate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Return Date</span>
                        <span className="font-medium">{invoice.returnDate}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">Total Days</span>
                        <span className="font-bold text-blue-600">{invoice.totalDays} day(s)</span>
                    </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">💰 Pricing Breakdown</h4>
                    <div className="space-y-2 text-sm">
                        {invoice.daysCharged > 0 && (
                            <div className="flex justify-between">
                                <span>{invoice.daysCharged} day(s) × {formatCurrency(invoice.dailyRate)}</span>
                                <span className="font-medium">{formatCurrency(invoice.dailyAmount)}</span>
                            </div>
                        )}
                        {invoice.weeksCharged > 0 && (
                            <div className="flex justify-between">
                                <span>{invoice.weeksCharged} week(s) × {formatCurrency(invoice.weeklyRate)}</span>
                                <span className="font-medium">{formatCurrency(invoice.weeklyAmount)}</span>
                            </div>
                        )}
                        {invoice.monthsCharged > 0 && (
                            <div className="flex justify-between">
                                <span>{invoice.monthsCharged} month(s) × {formatCurrency(invoice.monthlyRate)}</span>
                                <span className="font-medium">{formatCurrency(invoice.monthlyAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                            <span>Rental Amount</span>
                            <span className="font-medium">{formatCurrency(invoice.rentalAmount)}</span>
                        </div>
                        {invoice.addonName && (
                            <div className="flex justify-between">
                                <span>{invoice.addonName}</span>
                                <span className="font-medium">{formatCurrency(invoice.addonTotalAmount)}</span>
                            </div>
                        )}
                        {invoice.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Discount ({invoice.offerName})</span>
                                <span>-{formatCurrency(invoice.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-2 text-lg font-bold text-green-700">
                            <span>Total Amount</span>
                            <span>{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Button */}
            {!paymentSuccess ? (
                <div className="mt-6 flex gap-4">
                    <Button
                        size="lg"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handlePayment}
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : `💳 Pay Now - ${formatCurrency(invoice.totalAmount)}`}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/staff/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            ) : (
                <div className="mt-6">
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                        <p className="text-green-800 font-bold text-lg">✅ Payment Successful!</p>
                        <p className="text-green-700">Transaction ID: <span className="font-mono font-bold">{transactionId}</span></p>
                    </div>
                    <Button onClick={() => router.push('/staff/dashboard')} className="w-full">
                        Back to Dashboard
                    </Button>
                </div>
            )}
        </Card>
    );
}
