const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create a new booking - using fetch to avoid axios cookies issue
export const createBooking = async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // IMPORTANT: Don't send credentials (cookies) to prevent OAuth redirect
        credentials: 'omit',
        body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Booking failed' }));
        throw new Error(error.message || 'Booking failed');
    }

    return response.json();
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        credentials: 'omit',
    });
    return response.json();
};

// Get bookings by user
export const getBookingsByUser = async (userId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_BASE_URL}/api/bookings/user/${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'omit',
    });
    const data = await response.json();
    return data;
};

// Get all bookings (staff)
export const getAllBookings = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'omit',
    });
    const data = await response.json();
    if (Array.isArray(data)) {
        return { success: true, data };
    }
    return data;
};

// Update booking status (PATCH with query param)
export const updateBookingStatus = async (bookingId, status) => {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status?status=${status}`, {
        method: 'PATCH',
        credentials: 'omit',
    });
    return response.json();
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
    return updateBookingStatus(bookingId, 'cancelled');
};

// Delete booking
export const deleteBooking = async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'omit',
    });
    return response.json();
};
