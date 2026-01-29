import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm ">
                © {new Date().getFullYear()} FLEMAN. All rights reserved. | CDAC Group 08
            </div>

        </footer >
    );
}
