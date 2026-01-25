import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            <span className="font-bold text-xl text-white">FLEMAN</span>
                        </div>
                        <p className="text-gray-400 max-w-md">
                            Premium fleet management and vehicle rental solutions.
                            Experience hassle-free car rentals across India.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/vehicles" className="hover:text-white transition">Browse Vehicles</Link></li>
                            <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                            <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li>support@fleman.com</li>
                            <li>+91 98765 43210</li>
                            <li>Mumbai, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} FLEMAN. All rights reserved. | CDAC Group 08
                </div>
            </div>
        </footer>
    );
}
