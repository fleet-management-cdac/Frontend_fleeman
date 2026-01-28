'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getUserDetails } from '../../../services/authService';
import Spinner from '../../../components/ui/Spinner';

function LoginSuccessHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent running multiple times
        if (hasProcessed.current) return;

        const processOAuthLogin = async () => {
            const token = searchParams.get('token');

            if (token) {
                hasProcessed.current = true;

                // Store token and get profile completeness
                const isProfileComplete = await login(token);

                // Parse token for role
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decoded = JSON.parse(window.atob(base64));

                    // Check profile completeness - if phone number is missing, redirect to complete profile
                    setTimeout(async () => {
                        if (!isProfileComplete) {
                            // Profile incomplete - redirect to complete profile
                            router.replace('/complete-profile');
                        } else if (decoded.role === 'staff') {
                            router.replace('/staff/dashboard');
                        } else {
                            router.replace('/');
                        }
                    }, 100);
                } catch {
                    setTimeout(() => {
                        if (!isProfileComplete) {
                            router.replace('/complete-profile');
                        } else {
                            router.replace('/');
                        }
                    }, 100);
                }
            } else {
                hasProcessed.current = true;
                setTimeout(() => {
                    router.replace('/login?error=oauth_failed');
                }, 100);
            }
        };

        processOAuthLogin();
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Completing login...</p>
            </div>
        </div>
    );
}

export default function LoginSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <LoginSuccessHandler />
        </Suspense>
    );
}
