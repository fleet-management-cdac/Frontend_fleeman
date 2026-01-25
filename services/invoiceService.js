import api from '../lib/api';

// Process vehicle return and generate invoice
export const processReturn = async (bookingId, actualReturnDate) => {
    const response = await api.post('/api/invoices/return', {
        bookingId,
        actualReturnDate
    });
    return response.data;
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId) => {
    const response = await api.get(`/api/invoices/${invoiceId}`);
    return response.data;
};

// Get invoice for a booking
export const getInvoiceByBooking = async (bookingId) => {
    const response = await api.get(`/api/invoices/booking/${bookingId}`);
    return response.data;
};
