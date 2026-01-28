'use client';

import { useState, useEffect } from 'react';
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
        <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-md">
            {/* Top accent line for a splash of color without overwhelming */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img
                                src="/brandlogo.png"
                                alt="FLEEMAN Logo"
                                className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        </Link>
                    </div>



                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-5">
                        <div className="border-r border-gray-200 pr-5">
                            <LanguageSelector theme="light" />
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                {user?.role === 'staff' && (
                                    <Link href="/staff/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                        Dashboard
                                    </Link>
                                )}
                                <Link href="/my-bookings" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                    My Bookings
                                </Link>
                                <div className="relative group">
                                    <button className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-blue-700 transition">
                                        <span>Use Profile</span>
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                    </button>

                                    {/* Dropdown for user */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                        <div className="py-2">
                                            <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                                <p className="text-xs text-gray-500">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                            </div>
                                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Profile Settings</Link>
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-gray-700 font-bold hover:text-blue-700 hover:bg-blue-50/50 px-5 text-sm transition-all">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-gray-900 text-white hover:bg-black font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-gray-900/20 transform hover:-translate-y-0.5 transition-all text-sm border border-gray-900">
                                        Create Account
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <LanguageSelector theme="light" />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
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
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-fade-in-down z-40">
                        <div className="flex flex-col p-4 gap-2">
                            <Link href="/vehicles" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-xl transition-all font-bold flex items-center gap-3 border border-gray-100">
                                <span>🚗</span> Browse Fleet
                            </Link>
                            {user ? (
                                <>
                                    <div className="py-2 px-4 bg-gray-50 rounded-lg mt-2 mb-1 border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account</p>
                                        <p className="text-sm font-bold text-gray-900">{user.email}</p>
                                    </div>
                                    {user?.role === 'staff' && (
                                        <Link href="/staff/dashboard" className="text-blue-700 bg-blue-50 py-3 px-4 rounded-xl transition-all font-bold flex items-center gap-3 border border-blue-100 mb-2">
                                            <span>📊</span> Staff Dashboard
                                        </Link>
                                    )}
                                    <Link href="/my-bookings" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-xl transition-all font-medium">
                                        My Bookings
                                    </Link>
                                    <Link href="/profile" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-xl transition-all font-medium">
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout} className="text-left text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl transition-all font-bold w-full border border-transparent hover:border-red-100">
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t border-gray-100">
                                    <Link href="/login" className="text-center">
                                        <Button variant="ghost" className="w-full text-gray-700 hover:bg-gray-100 font-bold border border-gray-200">Log In</Button>
                                    </Link>
                                    <Link href="/register" className="text-center">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg">Sign Up</Button>
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
