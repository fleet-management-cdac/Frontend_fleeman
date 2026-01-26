'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import LanguageSelector from '../ui/LanguageSelector';
import { useI18n } from '../../context/I18nContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { t } = useI18n(); 
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        // Using window.location.href ensures a clean state reset on logout
        window.location.href = '/';
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">FLEMAN</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <LanguageSelector />

                        {user ? (
                            <>
                                <Link href="/my-bookings" className="text-gray-600 hover:text-gray-900 transition font-medium">
                                    {t('nav_my_bookings')}
                                </Link>
                                <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition font-medium">
                                    {t('nav_profile')}
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <span className="text-sm text-gray-500 hidden lg:inline">{user.email}</span>
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        {t('logout')}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">{t('login')}</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">{t('register')}</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center gap-4">
                        <LanguageSelector />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 p-2"
                            aria-label="Toggle Menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 bg-gray-50 px-2 rounded-b-lg">
                        <div className="flex flex-col gap-2">
                            <Link 
                                href="/vehicles" 
                                className="text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav_vehicles')}
                            </Link>
                            
                            {user ? (
                                <>
                                    <Link 
                                        href="/my-bookings" 
                                        className="text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {t('nav_my_bookings')}
                                    </Link>
                                    <Link 
                                        href="/profile" 
                                        className="text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {t('nav_profile')}
                                    </Link>
                                    <hr className="my-1 border-gray-200" />
                                    <button 
                                        onClick={handleLogout} 
                                        className="text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition font-medium"
                                    >
                                        {t('logout')}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">{t('login')}</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full justify-start">{t('register')}</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}