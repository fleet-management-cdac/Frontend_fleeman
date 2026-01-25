import api from '../lib/api';

// Get all vehicle types with rates (daily, weekly, monthly)
export const getVehicleTypesWithRates = async () => {
    const response = await api.get('/api/vehicles/types-with-rates');
    // API returns array directly, not wrapped in success/data
    return { success: true, data: response.data };
};

// Get vehicles by type
export const getVehiclesByType = async (typeId) => {
    const response = await api.get(`/api/vehicles/by-type/${typeId}`);
    return response.data;
};

// Get available vehicles for date range
export const getAvailableVehicles = async (pickupDate, returnDate, hubId) => {
    const response = await api.get('/api/vehicles/available', {
        params: { pickupDate, returnDate, hubId }
    });
    return response.data;
};

// Get vehicle details
export const getVehicleById = async (vehicleId) => {
    const response = await api.get(`/api/vehicles/${vehicleId}`);
    return response.data;
};
