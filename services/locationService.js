import api from '../lib/api';

// === STATES ===
export const getAllStates = async () => {
    const response = await api.get('/api/locations/states');
    return response.data;
};

// === CITIES ===
// NEW: Added this function to support the "Drop Location" dropdown
// export const getAllCities = async () => {
//     const response = await api.get('/api/locations/cities');
//     return response.data;
// };

export const getCitiesByState = async (stateId) => {
    const response = await api.get(`/api/locations/cities/state/${stateId}`);
    return response.data;
};

export const getCityById = async (cityId) => {
    const response = await api.get(`/api/locations/city/${cityId}`);
    return response.data;
};

// === HUBS ===
export const getHubsByCity = async (cityId) => {
    const response = await api.get(`/api/locations/hubs/city/${cityId}`);
    return response.data;
};

// === AIRPORTS ===
export const getAllAirports = async () => {
    const response = await api.get('/api/locations/airports');
    return response.data;
};

export const getAirportsByState = async (stateId) => {
    const response = await api.get(`/api/locations/airports/state/${stateId}`);
    return response.data;
};

export const getAirportByCode = async (code) => {
    const response = await api.get(`/api/locations/airports/code/${code}`);
    return response.data;
};