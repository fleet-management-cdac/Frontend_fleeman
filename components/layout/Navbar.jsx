'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import LanguageSelector from '../ui/LanguageSelector';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
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
                                <Link href="/my-bookings" className="text-gray-600 hover:text-gray-900 transition">
                                    My Bookings
                                </Link>
                                <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition">
                                    Profile
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <span className="text-sm text-gray-500">{user.email}</span>
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900"
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

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col gap-3">
                            <Link href="/vehicles" className="text-gray-600 hover:text-gray-900 py-2">
                                Vehicles
                            </Link>
                            {user ? (
                                <>
                                    <Link href="/my-bookings" className="text-gray-600 hover:text-gray-900 py-2">
                                        My Bookings
                                    </Link>
                                    <Link href="/profile" className="text-gray-600 hover:text-gray-900 py-2">
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout} className="text-left text-gray-600 hover:text-gray-900 py-2">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-600 hover:text-gray-900 py-2">
                                        Login
                                    </Link>
                                    <Link href="/register" className="text-gray-600 hover:text-gray-900 py-2">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
