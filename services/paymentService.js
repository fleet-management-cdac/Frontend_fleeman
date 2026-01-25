import api from '../lib/api';

// Create Razorpay order
export const createPaymentOrder = async (invoiceId) => {
    const response = await api.post('/api/payments/create-order', { invoiceId });
    return response.data;
};

// Verify payment
export const verifyPayment = async (paymentData) => {
    const response = await api.post('/api/payments/verify', paymentData);
    return response.data;
};

// Open Razorpay checkout
export const openRazorpayCheckout = (orderData, onSuccess, onError) => {
    const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: 'INR',
        name: 'FLEMAN',
        description: 'Vehicle Rental Payment',
        order_id: orderData.orderId,
        handler: async (response) => {
            try {
                const verifyResponse = await verifyPayment({
                    invoiceId: orderData.invoiceId,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                });
                onSuccess(verifyResponse);
            } catch (error) {
                onError(error);
            }
        },
        prefill: {
            email: orderData.email || '',
            contact: orderData.phone || '',
        },
        theme: {
            color: '#2563eb',
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
};
