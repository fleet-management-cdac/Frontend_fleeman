'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { parseJwt, isTokenExpired } from '../lib/utils';
import { getUserDetails } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [profileComplete, setProfileComplete] = useState(true); // Assume complete until checked

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsClient(true);
        checkAuth();
    }, []);

    // Force redirect to complete-profile if profile is incomplete
    useEffect(() => {
        if (!loading && user && !profileComplete) {
            // Allow logout or staying on the complete-profile page
            if (pathname !== '/complete-profile' && pathname !== '/login') {
                router.replace('/complete-profile');
            }
        }
    }, [loading, user, profileComplete, pathname, router]);

    const checkAuth = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            const decoded = parseJwt(token);
            let userData = {
                id: decoded.userId,
                email: decoded.email || decoded.sub,
                role: decoded.role,
                hubId: decoded.hubId || null,
                isOAuth: decoded.isOAuth || false,
                name: null // Initialize name
            };

            // Calculate profile completeness and fetch name
            try {
                // Fetch details for ALL users to get name
                const response = await getUserDetails(decoded.userId);

                if (response.success && response.data) {
                    const details = response.data;

                    // Set name if available
                    if (details.firstName) {
                        userData.name = `${details.firstName} ${details.lastName || ''}`.trim();
                    }

                    // Set hub name if available
                    if (details.hubName) {
                        userData.hubName = details.hubName;
                    }

                    // Profile completeness logic
                    if (userData.role === 'staff') {
                        setProfileComplete(true);
                        localStorage.setItem('profileComplete', 'true');
                    } else {
                        // Customer profile check
                        const isComplete = !!details.phoneCell;
                        setProfileComplete(isComplete);
                        localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
                    }
                } else {
                    // No details found
                    if (userData.role === 'staff') {
                        setProfileComplete(true);
                        localStorage.setItem('profileComplete', 'true');
                    } else {
                        setProfileComplete(false);
                        localStorage.setItem('profileComplete', 'false');
                    }
                }
            } catch (error) {
                // Error fetching details
                if (userData.role === 'staff') {
                    setProfileComplete(true);
                    localStorage.setItem('profileComplete', 'true');
                } else if (decoded.isOAuth) {
                    setProfileComplete(false);
                    localStorage.setItem('profileComplete', 'false');
                }
            }

            setUser(userData);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('profileComplete');
            setUser(null);
            setProfileComplete(true);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (token) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('token', token);
        const decoded = parseJwt(token);
        let userData = {
            id: decoded.userId,
            email: decoded.email || decoded.sub,
            role: decoded.role,
            hubId: decoded.hubId || null,
            isOAuth: decoded.isOAuth || false,
            name: null
        };

        try {
            // Fetch details for name and completeness
            const response = await getUserDetails(decoded.userId);

            if (response.success && response.data) {
                const details = response.data;

                if (details.firstName) {
                    userData.name = `${details.firstName} ${details.lastName || ''}`.trim();
                }

                // Set hub name if available
                if (details.hubName) {
                    userData.hubName = details.hubName;
                }

                if (userData.role === 'staff') {
                    setProfileComplete(true);
                    localStorage.setItem('profileComplete', 'true');
                    setUser(userData);
                    return true;
                }

                const isComplete = !!details.phoneCell;
                setProfileComplete(isComplete);
                localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
                setUser(userData);
                return isComplete;
            }
        } catch (error) {
            // Error handling
            if (userData.role === 'staff') {
                setProfileComplete(true);
                localStorage.setItem('profileComplete', 'true');
                setUser(userData);
                return true;
            }

            if (decoded.isOAuth) {
                setProfileComplete(false);
                localStorage.setItem('profileComplete', 'false');
                setUser(userData);
                return false;
            }
        }

        setUser(userData);
        // Fallback for non-OAuth customer with error -> assume complete or let regular flow handle
        if (userData.role === 'customer' && !userData.isOAuth) {
            // Usually implies login successful but maybe no details yet? maintain existing behavior
            return true;
        }
        return true;
    }, []);

    const logout = useCallback(() => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('token');
        localStorage.removeItem('profileComplete');
        setUser(null);
        setProfileComplete(true);
    }, []);

    const markProfileComplete = useCallback(() => {
        setProfileComplete(true);
        localStorage.setItem('profileComplete', 'true');
    }, []);

    const isCustomer = useCallback(() => user?.role === 'customer', [user]);
    const isStaff = useCallback(() => user?.role === 'staff', [user]);

    // Don't render children until we're on client
    if (!isClient) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isCustomer,
            isStaff,
            checkAuth,
            profileComplete,
            markProfileComplete
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
