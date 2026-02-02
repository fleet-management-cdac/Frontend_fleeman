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

    const handlePrint = () => {
        window.print();
    };

    return (
        <Card className="mt-6 p-6">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice, #printable-invoice * {
                        visibility: visible;
                    }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                }
            `}</style>

            {/* Printable Invoice - Hidden on screen */}
            <div id="printable-invoice" className="hidden bg-white p-8 text-black">
                <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">FLEEMAN.</h1>
                        <p className="text-gray-500 font-medium">Premium Fleet Services</p>
                        <div className="text-sm text-gray-500 mt-2">
                            <p>123 Business Park, Tech Hub</p>
                            <p>Pune, MH 411057</p>
                            <p>support@fleeman.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-600 uppercase tracking-widest">Invoice</h2>
                        <p className="text-lg font-mono font-bold text-gray-900 mt-1">#{invoice.invoiceId}</p>
                        <p className="text-sm text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                        {transactionId && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-xs inline-block">
                                <p className="text-green-700 font-bold">PAID</p>
                                <p className="text-green-600 font-mono">{transactionId}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                        <p className="text-xl font-bold text-gray-900">{invoice.customerName}</p>
                        <p className="text-gray-600">{invoice.customerEmail}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle Details</h3>
                        <p className="text-lg font-bold text-gray-900">{invoice.vehicleName}</p>
                        <p className="text-gray-600 font-mono">{invoice.vehicleRegistration}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                        <div className="text-sm">
                            <p className="text-gray-500">Rental Period</p>
                            <p className="font-bold text-gray-900">{invoice.handoverDate} — {invoice.returnDate}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm">Duration</p>
                            <p className="font-bold text-gray-900 text-lg">{invoice.totalDays} Days</p>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="pb-2 font-medium">Description</th>
                                <th className="pb-2 text-right font-medium">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {invoice.daysCharged > 0 && (
                                <tr>
                                    <td className="py-2">{invoice.daysCharged} days × {formatCurrency(invoice.dailyRate)}</td>
                                    <td className="py-2 text-right">{formatCurrency(invoice.dailyAmount)}</td>
                                </tr>
                            )}
                            {invoice.weeksCharged > 0 && (
                                <tr>
                                    <td className="py-2">{invoice.weeksCharged} weeks × {formatCurrency(invoice.weeklyRate)}</td>
                                    <td className="py-2 text-right">{formatCurrency(invoice.weeklyAmount)}</td>
                                </tr>
                            )}
                            {invoice.monthsCharged > 0 && (
                                <tr>
                                    <td className="py-2">{invoice.monthsCharged} months × {formatCurrency(invoice.monthlyRate)}</td>
                                    <td className="py-2 text-right">{formatCurrency(invoice.monthlyAmount)}</td>
                                </tr>
                            )}
                            {invoice.addonName && (
                                <tr>
                                    <td className="py-2">Addon: {invoice.addonName}</td>
                                    <td className="py-2 text-right">{formatCurrency(invoice.addonTotalAmount)}</td>
                                </tr>
                            )}
                            {invoice.discountAmount > 0 && (
                                <tr className="text-green-600">
                                    <td className="py-2">Discount ({invoice.offerName})</td>
                                    <td className="py-2 text-right">-{formatCurrency(invoice.discountAmount)}</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="text-lg font-bold text-gray-900 border-t-2 border-gray-800">
                            <tr>
                                <td className="pt-4">Total Amount</td>
                                <td className="pt-4 text-right">{formatCurrency(invoice.totalAmount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="text-center text-sm text-gray-400 mt-16 border-t pt-8">
                    <p>Thank you for choosing Fleeman!</p>
                    <p className="mt-1 text-xs">For support, call +91 98765 43210</p>
                </div>
            </div>

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
                <div className="mt-6 flex gap-3">
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex-1">
                        <p className="text-green-800 font-bold text-lg">✅ Payment Successful!</p>
                        {transactionId && <p className="text-green-700">Transaction ID: <span className="font-mono font-bold">{transactionId}</span></p>}
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                        <Button onClick={handlePrint} className="bg-gray-800 hover:bg-gray-900">
                            🖨️ Print Invoice
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/staff/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
