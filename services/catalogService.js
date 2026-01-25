import api from '../lib/api';

// Get all available vehicles
export const getAvailableVehicles = async () => {
    const response = await api.get('/api/catalog/available');
    return response.data;
};

// Get available vehicles by hub
export const getAvailableVehiclesByHub = async (hubId) => {
    const response = await api.get(`/api/catalog/available/${hubId}`);
    return response.data;
};
