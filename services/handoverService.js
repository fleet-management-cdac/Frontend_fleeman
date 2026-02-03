import api from '../lib/api';

// Create handover when vehicle is given to customer
export const createHandover = async (handoverData) => {
    const response = await api.post('/api/handovers', handoverData);
    return response.data;
};

// Get handover by ID
export const getHandoverById = async (handoverId) => {
    const response = await api.get(`/api/handovers/${handoverId}`);
    return response.data;
};

// Get handovers for a booking
export const getHandoversByBooking = async (bookingId) => {
    const response = await api.get(`/api/handovers/booking/${bookingId}`);
    return response.data;
};

// Process return handover - updates vehicle hub to return location
export const processReturnHandover = async (handoverData) => {
    const response = await api.post('/api/handovers/return', handoverData);
    return response.data;
};
