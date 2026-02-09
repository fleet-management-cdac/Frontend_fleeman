import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {/* Simple text logo if image not available, or re-use brand logo if appropriate. 
                                Using text for cleaner footer look or fallback. */}
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-violet-500">
                                FLEEMAN
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Premium fleet management solutions for modern businesses. Simplify your operations with our cutting-edge platform.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/vehicles" className="hover:text-blue-400 transition-colors">Browse Fleet</Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-blue-400 transition-colors">Register</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
                        <div className="flex space-x-4 mb-4">
                            {/* Social Icons (SVGs) */}
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-sky-500 hover:text-white transition-all">
                                <span className="sr-only">Twitter</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-pink-600 hover:text-white transition-all">
                                <span className="sr-only">Instagram</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2zm-1.087 1.745c-2.584 0-2.887.01-3.905.056-1.018.046-1.57.206-1.936.349-.49.19-.845.418-1.215.788-.37.37-.598.725-.788 1.215-.143.366-.303.918-.349 1.936-.046 1.018-.056 1.321-.056 3.905 0 2.584.01 2.887.056 3.905.046 1.018.206 1.57.349 1.936.19.49.418.845.788 1.215.37.37.725.598 1.215.788.366.143.918.303 1.936.349 1.018.046 1.321.056 3.905.056 2.584 0 2.887-.01 3.905-.056 1.018-.046 1.57-.206 1.936-.349.49-.19.845-.418 1.215-.788.37-.37.598-.725.788-1.215.143-.366.303-.918.349-1.936.046-1.018.056-1.321.056-3.905 0-2.584-.01-2.887-.056-3.905-.046-1.018-.206-1.57-.349-1.936-.19-.49-.418-.845-.788-1.215-.37-.37-.725-.598-1.215-.788.366-.143.918-.303-1.936-.349-1.018-.046-1.321-.056-3.905-.056zM12.315 7a5.315 5.315 0 110 10.63 5.315 5.315 0 010-10.63zm0 1.745a3.57 3.57 0 100 7.14 3.57 3.57 0 000-7.14zm5.66-4.522a1.205 1.205 0 110 2.41 1.205 1.205 0 010-2.41z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>Email: support@fleeman.com</p>
                            <p>Phone: +1 234 567 890</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">
                    <p>© {new Date().getFullYear()} FLEMAN. All rights reserved. | CDAC Group 08</p>
                    <div className="mt-2 space-x-4">
                        <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer >
    );
}
