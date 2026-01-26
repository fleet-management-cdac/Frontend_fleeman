import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { I18nProvider } from '../context/I18nContext'; // 1. Import the Provider

export const metadata = {
    title: 'FLEMAN - Fleet Management & Vehicle Rental',
    description: 'Premium fleet management and car rental services across India. Book your ride today!',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <script src="https://checkout.razorpay.com/v1/checkout.js" async />
            </head>
            <body className="min-h-screen bg-gray-50">
                <AuthProvider>
                    {/* 2. Wrap everything inside I18nProvider */}
                    <I18nProvider>
                        {children}
                    </I18nProvider>
                </AuthProvider>
            </body>
        </html>
    );
}