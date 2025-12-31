'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader, Calendar, Clock, Users, CreditCard, MapPin, Smartphone, X } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const VendorBookingManagement = () => {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [verificationPin, setVerificationPin] = useState('')

    const handleVerifyPin = () => {
        if (!verificationPin) return;
        if (verificationPin === selectedBooking?.pin) {
            alert("✅ PIN Verified Successfully! User is authorized.");
        } else {
            alert("❌ Invalid PIN. Please try again.");
        }
    };

    // Sub-component for resilient image loading
    const UserProfileImage = ({ url, alt }) => {
        const [error, setError] = useState(false);

        if (error || !url) {
            return <Users className="w-6 h-6 text-gray-400" />;
        }

        return (
            <img
                src={url}
                alt={alt}
                className="w-12 h-12 object-cover"
                onError={() => setError(true)}
            />
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Bookings
                const bookingsRes = await fetch('/api/user/bookings', { headers });
                if (bookingsRes.ok) {
                    const data = await bookingsRes.json();
                    if (data.bookings && data.bookings.length > 0) {
                        console.log("First booking user data:", data.bookings[0].user_id);
                    }
                    setBookings(data.bookings || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleCardClick = (booking) => {
        setSelectedBooking(booking);
    };

    const handleCloseDetails = (e) => {
        e.stopPropagation();
        setSelectedBooking(null);
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatEnum = (text) => {
        if (!text) return '';
        return text.replace(/_/g, ' ')
            .replace('FACILITY TYPE', '')
            .replace('PAYMENT STATUS', '')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .trim();
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader className='h-8 w-8 animate-spin' /></div>;

    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden relative gap-6">
            {/* Left Panel - Booking List */}
            <div
                className={`transition-all duration-500 ease-in-out h-full overflow-y-auto ${selectedBooking ? 'w-2/3 pr-6' : 'w-full'
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Bookings</h3>
                </div>

                <div className={`grid gap-6 p-2 ${selectedBooking ? 'grid-cols-1' : 'grid-cols-1'}`}>
                    {bookings.length > 0 ? bookings.map((booking) => (
                        <Card
                            key={booking._id}
                            className={`cursor-pointer group relative overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl ${selectedBooking?._id === booking._id ? 'ring-2 ring-black ring-offset-2' : ''}`}
                            onClick={() => handleCardClick(booking)}
                        >
                            <CardContent className="p-0">
                                <div className="p-8"> {/* Increased padding for more height */}
                                    <div className="flex items-start gap-6">
                                        {/* Avatar with Ring - Centered */}
                                        <div className="relative">
                                            <div className="h-20 w-20 rounded-full p-1 bg-gray-100 shadow-inner">
                                                <div className="h-full w-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                                    <UserProfileImage
                                                        url={booking.user_id?.profile_image_url}
                                                        alt="User"
                                                    />
                                                </div>
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 h-6 w-6 border-4 border-white rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-2xl text-gray-900 leading-tight"> {/* Increased text size */}
                                                        {booking.user_id?.first_name} {booking.user_id?.last_name || 'Guest User'}
                                                    </h4>
                                                    <p className="text-base text-gray-500 font-medium mt-1 flex items-center gap-1.5"> {/* Increased text size */}
                                                        <Smartphone className="w-4 h-4" />
                                                        {booking.user_id?.phone_number || 'No Phone'}
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={`${getStatusColor(booking.status)} px-4 py-1.5 text-xs font-bold tracking-wide border-0 rounded-full shadow-sm`}
                                                >
                                                    {booking.status || 'UNKNOWN'}
                                                </Badge>
                                            </div>

                                            {/* Metadata Grid */}
                                            <div className="grid grid-cols-2 gap-5 mt-6"> {/* Increased gap and margin for height */}
                                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100"> {/* Increased padding */}
                                                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gender</p> {/* Increased text size */}
                                                        <p className="text-base font-bold text-gray-700"> {/* Increased text size */}
                                                            {formatEnum(booking.user_id?.gender) || 'Not Specified'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Member Since</p>
                                                        <p className="text-base font-bold text-gray-700">
                                                            {booking.user_id?.user_since ? format(new Date(booking.user_id.user_since), 'MMM yyyy') : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Strip - Neutral Color */}
                                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center transition-colors">
                                    <span className="text-sm font-medium text-gray-500">
                                        Tap to view details
                                    </span>
                                    <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                                        View Booking <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all">→</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No bookings found</p>
                            <p className="text-sm text-gray-400">New bookings will appear here instantly.</p>
                        </div>
                    )}
                </div>
            </div >

            {/* Right Panel - Details Slide-in */}
            < div
                className={`
                    absolute right-0 top-0 h-full bg-white shadow-2xl border-l z-20
                    transition-all duration-500 ease-in-out transform
                    ${selectedBooking ? 'translate-x-0 w-1/3 opacity-100' : 'translate-x-full w-1/3 opacity-0'}
                `}
            >
                {selectedBooking && (
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Booking Details</h3>
                            <Button variant="ghost" size="icon" onClick={handleCloseDetails} className="h-8 w-8 rounded-full hover:bg-gray-200">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-6">

                            {/* PIN Verification Section */}
                            <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Verify User Entry</label>
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="Enter User PIN"
                                        value={verificationPin}
                                        onChange={(e) => setVerificationPin(e.target.value)}
                                        className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                                    />
                                    <Button
                                        onClick={handleVerifyPin}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                    >
                                        Verify
                                    </Button>
                                </div>
                            </div>

                            {/* Slot Timing Highlight */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Slot Start Time</p>
                                    <h4 className="text-xl font-bold text-blue-900">
                                        {format(new Date(selectedBooking.slot_start_time), 'p')}
                                    </h4>
                                    <p className="text-sm text-blue-700">
                                        {format(new Date(selectedBooking.slot_start_time), 'PPP')}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>

                            {/* Facility Type Badge */}
                            <div className="flex justify-start">
                                <Badge className="bg-black hover:bg-black text-white border-none text-md px-6 py-1.5 shadow-sm">
                                    {formatEnum(selectedBooking.facility_id?.type)}
                                </Badge>
                            </div>

                            {/* Facility Image */}
                            <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-md group">
                                {selectedBooking.facility_id?.image_urls?.[0] ? (
                                    <Image
                                        src={selectedBooking.facility_id.image_urls[0]}
                                        alt={selectedBooking.facility_id.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Users className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            {/* Main Info */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                                    {selectedBooking.facility_id?.name}
                                </h2>
                                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                                    {selectedBooking.fitness_center_id?.name}
                                </h3>
                               
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 text-gray-900 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Duration</p>
                                    <p className="font-semibold">{selectedBooking.facility_id?.duration_minutes || 60} min</p>
                                </div>
                                <div className="p-3 bg-purple-50 text-purple-900 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Instructor</p>
                                    <p className="font-semibold truncate">{selectedBooking.facility_id?.instructor_name || 'N/A'}</p>
                                </div>
                            </div>



                            {/* Payment Info */}
                            <div className="border rounded-xl p-4 bg-gray-50/50 space-y-3">
                                <h4 className="font-semibold text-gray-900 text-sm flex items-center mb-2">
                                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" /> Payment Details
                                </h4>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <Badge variant="outline" className={selectedBooking.payment_status === 'PAID' ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'}>
                                        {formatEnum(selectedBooking.payment_status) || 'Pending'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-medium">{selectedBooking.payment_method || 'Online'}</span>
                                </div>
                                <div className="border-t border-dashed my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Total Amount</span>
                                    <span className="font-bold text-lg text-gray-900">₹{selectedBooking.amount_total}</span>
                                </div>
                            </div>

                            <div className="text-center text-xs text-gray-400 pt-4">
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    )
}

export default VendorBookingManagement
