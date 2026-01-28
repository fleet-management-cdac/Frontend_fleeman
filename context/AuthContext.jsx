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
            const userData = {
                id: decoded.userId,
                email: decoded.email || decoded.sub,
                role: decoded.role,
                isOAuth: decoded.isOAuth || false,
            };
            setUser(userData);

            // Check if profile is complete for OAuth users
            try {
                // If staff, we consider profile complete or irrelevant for this check
                if (userData.role === 'staff') {
                    setProfileComplete(true);
                    localStorage.setItem('profileComplete', 'true');
                } else {
                    const response = await getUserDetails(decoded.userId);
                    if (response.success && response.data) {
                        const details = response.data;
                        // Profile is complete if phone number exists
                        const isComplete = !!details.phoneCell;
                        setProfileComplete(isComplete);
                        localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
                    } else {
                        setProfileComplete(false);
                        localStorage.setItem('profileComplete', 'false');
                    }
                }
            } catch (error) {
                // If can't fetch details, assume incomplete for OAuth users
                if (decoded.isOAuth) {
                    setProfileComplete(false);
                    localStorage.setItem('profileComplete', 'false');
                }
            }
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
        const userData = {
            id: decoded.userId,
            email: decoded.email || decoded.sub,
            role: decoded.role,
            isOAuth: decoded.isOAuth || false,
        };
        setUser(userData);

        // Check profile completeness
        try {
            if (userData.role === 'staff') {
                setProfileComplete(true);
                localStorage.setItem('profileComplete', 'true');
                return true;
            }

            const response = await getUserDetails(decoded.userId);
            if (response.success && response.data) {
                const isComplete = !!response.data.phoneCell;
                setProfileComplete(isComplete);
                localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
                return isComplete;
            }
        } catch (error) {
            if (decoded.isOAuth) {
                setProfileComplete(false);
                localStorage.setItem('profileComplete', 'false');
                return false;
            }
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
