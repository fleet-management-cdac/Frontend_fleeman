import api from '../lib/api';

// Login with email/password
export const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
};

// Register new customer
export const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
};

// Google OAuth - redirect to backend
export const googleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
};

// Get user profile by userDetailsId
export const getUserDetails = async (userDetailId) => {
    const response = await api.get(`/api/users/details/${userDetailId}`);
    return response.data;
};

// Forgot password - request reset email
export const forgotPassword = async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
};
