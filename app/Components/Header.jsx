"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">FleetMan</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                            Dashboard
                        </Link>
                        <Link href="/vehicles" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                            Vehicles
                        </Link>
                        <Link href="/drivers" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                            Drivers
                        </Link>
                        <Link href="/routes" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                            Routes
                        </Link>
                        <Link href="/reports" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                            Reports
                        </Link>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-cyan-400 transition-all duration-300"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <nav className="flex flex-col gap-4">
                            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link href="/vehicles" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                                Vehicles
                            </Link>
                            <Link href="/drivers" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                                Drivers
                            </Link>
                            <Link href="/routes" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                                Routes
                            </Link>
                            <Link href="/reports" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                                Reports
                            </Link>
                            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                                <Link href="/login" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-lg text-center"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
