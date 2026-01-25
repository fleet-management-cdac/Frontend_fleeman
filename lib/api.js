import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Don't send cookies by default - prevents OAuth redirect for guest users
    withCredentials: false,
});

// Request interceptor - Add JWT token if available
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect on 401 for public endpoints
        if (error.response?.status === 401) {
            const publicPaths = ['/api/bookings', '/api/vehicles', '/api/catalog', '/api/locations'];
            const isPublicPath = publicPaths.some(path => error.config.url.includes(path));

            if (!isPublicPath && typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
