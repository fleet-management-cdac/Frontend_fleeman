import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { I18nProvider } from '../context/I18nContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
                    <I18nProvider>
                        {children}
                        <ToastContainer position="bottom-left" theme="colored" autoClose={3000} />
                    </I18nProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
