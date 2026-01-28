// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext';
// import { getBookingsByUser } from '../../services/bookingService';
// import { getUserDetails } from '../../services/authService';
// import Navbar from '../../components/layout/Navbar';
// import Footer from '../../components/layout/Footer';
// import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
// import Badge from '../../components/ui/Badge';
// import Spinner from '../../components/ui/Spinner';
// import { formatDate, formatCurrency } from '../../lib/utils';

// export default function CustomerDashboard() {
//     const router = useRouter();
//     const { user, loading: authLoading, profileComplete } = useAuth();
//     const [profile, setProfile] = useState(null);
//     const [bookings, setBookings] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Redirect if profile is incomplete
//     useEffect(() => {
//         if (!authLoading && user && !profileComplete) {
//             router.replace('/complete-profile');
//         }
//     }, [authLoading, user, profileComplete, router]);

//     useEffect(() => {
//         if (user?.id && profileComplete) {
//             fetchData();
//         }
//     }, [user, profileComplete]);

//     const fetchData = async () => {
//         try {
//             const [profileRes, bookingsRes] = await Promise.all([
//                 getUserDetails(user.id),
//                 getBookingsByUser(user.id),
//             ]);
//             if (profileRes.success) setProfile(profileRes.data);
//             if (bookingsRes.success) setBookings(bookingsRes.data || []);
//         } catch (error) {
//             console.error('Error fetching dashboard data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (authLoading || loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <Spinner size="lg" />
//             </div>
//         );
//     }

//     const activeBookings = bookings.filter(b => ['reserved', 'confirmed', 'active'].includes(b.status));
//     const completedBookings = bookings.filter(b => b.status === 'completed');

//     return (
//         <>
//             <Navbar />
//             <main className="min-h-screen bg-gray-50 py-8">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="mb-8">
//                         <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.firstName || 'Customer'}! 👋</h1>
//                         <p className="text-gray-500 mt-1">Here's what's happening with your bookings</p>
//                     </div>

//                     <div className="grid sm:grid-cols-3 gap-6 mb-8">
//                         <Card className="p-6">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-gray-500">Active Bookings</p>
//                                     <p className="text-3xl font-bold text-blue-600">{activeBookings.length}</p>
//                                 </div>
//                                 <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                                     <span className="text-2xl">🚗</span>
//                                 </div>
//                             </div>
//                         </Card>
//                         <Card className="p-6">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-gray-500">Completed Trips</p>
//                                     <p className="text-3xl font-bold text-green-600">{completedBookings.length}</p>
//                                 </div>
//                                 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                                     <span className="text-2xl">✅</span>
//                                 </div>
//                             </div>
//                         </Card>
//                         <Card className="p-6">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-gray-500">Total Bookings</p>
//                                     <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
//                                 </div>
//                                 <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
//                                     <span className="text-2xl">📊</span>
//                                 </div>
//                             </div>
//                         </Card>
//                     </div>

//                     <Card className="p-6 mb-8">
//                         <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
//                         <div className="flex flex-wrap gap-4">
//                             <Link href="/vehicles"><Button>Book a Vehicle</Button></Link>
//                             <Link href="/my-bookings"><Button variant="secondary">View All Bookings</Button></Link>
//                             <Link href="/profile"><Button variant="outline">Update Profile</Button></Link>
//                         </div>
//                     </Card>

//                     <Card>
//                         <Card.Header>
//                             <div className="flex items-center justify-between">
//                                 <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
//                                 <Link href="/my-bookings" className="text-blue-600 hover:underline text-sm">View all</Link>
//                             </div>
//                         </Card.Header>
//                         <Card.Body className="p-0">
//                             {bookings.length === 0 ? (
//                                 <div className="p-8 text-center">
//                                     <p className="text-gray-500 mb-4">You haven't made any bookings yet</p>
//                                     <Link href="/vehicles"><Button>Browse Vehicles</Button></Link>
//                                 </div>
//                             ) : (
//                                 <div className="divide-y divide-gray-100">
//                                     {bookings.slice(0, 5).map((booking) => (
//                                         <div key={booking.bookingId || booking.id} className="p-4 hover:bg-gray-50 transition">
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <p className="font-medium text-gray-900">{booking.vehicleTypeName || booking.vehicleName || 'Vehicle'}</p>
//                                                     <p className="text-sm text-gray-500">{formatDate(booking.pickupDatetime)} - {formatDate(booking.returnDatetime)}</p>
//                                                 </div>
//                                                 <div className="text-right">
//                                                     <Badge status={booking.status}>{booking.status}</Badge>
//                                                     {booking.totalAmount && <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(booking.totalAmount)}</p>}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </Card.Body>
//                     </Card>
//                 </div>
//             </main>
//             <Footer />
//         </>
//     );
// }
