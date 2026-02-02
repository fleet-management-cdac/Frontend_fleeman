import api from '../lib/api';

// Create new staff member
export const createStaff = async (staffData) => {
    const response = await api.post('/api/admin/staff', staffData);
    return response.data;
};

// Get all staff members
export const getAllStaff = async () => {
    const response = await api.get('/api/admin/staff');
    return response.data;
};

// Assign hub to staff member
export const assignHubToStaff = async (userId, hubId) => {
    const response = await api.put(`/api/admin/staff/${userId}/hub`, { hubId });
    return response.data;
};

// Delete staff member
export const deleteStaff = async (userId) => {
    const response = await api.delete(`/api/admin/staff/${userId}`);
    return response.data;
};
