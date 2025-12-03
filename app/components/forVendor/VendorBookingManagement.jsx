'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader } from 'lucide-react'
import { useFitnessCentre } from '@/app/context/FitnessCentreContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const VendorBookingManagement = () => {
    const { fitnessCentreId } = useFitnessCentre()
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [bookings, setBookings] = useState([])
    const [allBookings, setAllBookings] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user, loading: authLoading } = useAuth()
    const [orders, setOrders] = useState([]);
    const router = useRouter()

    const updateOrderStatus = async (id, status) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/fitness-center/updateOrderStatus/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: status
                })
            })
            const data = await response.json()
            if (data.message === "OK") {
                alert("Successfully updated");
                const index = orders.findIndex(order => order.id === id);
                orders[index].status = "collected by user"
            } else {
                alert(data.message)
            }
        } catch (error) {
            alert("Some error occured! Please try again")
        }
    }

    const fetchBookingHistory = async () => {
        setLoading(true)
        setError(null)
        const id = fitnessCentreId
        console.log(id)
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/fitness-center/bookingHistory/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
            if (!response.ok) {
                throw new Error('Failed to fetch booking history')
            }
            const data = await response.json()
            const allBookings = data.Sessions.flatMap(session =>
                session.Slot.flatMap(slot => ({
                    ...slot.Booking,
                    category: session.category,
                }))
            );

            const userDetails = allBookings.map(booking => booking.Users)
            const allOrders = allBookings.map(booking => booking.Users.orders);
            console.log(allBookings)
            setAllBookings(allBookings)
            setUsers(userDetails)
            // setOrders(allOrders);
            filterBookingsByDate(selectedDate, allBookings);
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filterBookingsByDate = (date, bookings) => {
        if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const filteredBookings = bookings.filter(booking =>
                booking.Slot.some(slot =>
                    format(new Date(slot.time), 'yyyy-MM-dd') === formattedDate
                )
            );
            setBookings(filteredBookings);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        if (date) {
            filterBookingsByDate(date, allBookings);
        } else {
            setBookings([]);
        }
    };

    useEffect(() => {
        if (user)
            fetchBookingHistory()
    }, [user])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                        <div className="w-full lg:w-1/4 space-y-6">
                            <div className="p-4 border rounded-lg shadow-sm bg-white">
                                <Calendar
                                    className="flex justify-center items-center rounded-md border"
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                />
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Bookings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-gray-600 mb-3">
                                        {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
                                    </div>
                                    <div className="text-4xl font-bold text-red-600">
                                        {/* {selectedDate ? bookings.length : 0} */}
                                        {selectedDate ? bookings.reduce((total, booking) => total + booking.Slot.length, 0) : 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="w-full lg:w-3/4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Bookings for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div><Loader className='h-8 w-8 animate-spin' /></div>
                                    ) : error ? (
                                        <p className="text-red-600">Error: {error}</p>
                                    ) : bookings.length > 0 ? (
                                        <div className="h-[387px] overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-1/4">User</TableHead>
                                                        <TableHead className="w-1/4">Category</TableHead>
                                                        <TableHead className="w-1/4">Time</TableHead>
                                                        <TableHead className="w-1/4">Price</TableHead>
                                                        <TableHead className="w-1/4">Orders</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {bookings.map((booking, index) => (
                                                        // <TableRow key={booking.id}>
                                                        booking.Slot.map((slot, slotIndex) => (
                                                            <TableRow key={`${booking.id}-${slot.id}-${slotIndex}`}>
                                                                <TableCell className="w-1/4">{`${booking.Users.first_name} ${booking.Users.last_name || null}`}</TableCell>
                                                                <TableCell className="w-1/4">{booking.category}</TableCell>
                                                                <TableCell className="w-1/4">
                                                                    {/* {booking.Slot.map(slot => format(new Date(slot.time), 'PPPpp')).join(', ')} */}
                                                                    {format(new Date(slot.time), 'PPP p')}
                                                                </TableCell>
                                                                <TableCell className="w-1/4">&#8377;{booking.total_price}</TableCell>
                                                                <TableCell>
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button onClick={() => { setOrders(booking.Users.orders) }} variant="outline">Orders</Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="sm:max-w-[425px]">
                                                                            <DialogHeader>
                                                                                <DialogTitle>Orders</DialogTitle>
                                                                            </DialogHeader>
                                                                            {orders.map((order) => (
                                                                                <div key={order.id} className="grid grid-cols-2 items-center gap-4">
                                                                                    <label htmlFor={`order-${order.product_id}`} className="text-right font-medium">
                                                                                        {order.Market_Place.product_name || order.product_id} {'(x' + order.quantity + ')'}
                                                                                    </label>
                                                                                    {
                                                                                        order.status.toLowerCase() !== "collected by user" ?
                                                                                            <Button className='bg-red-600 hover:bg-red-700' onClick={() => updateOrderStatus(order.id, "collected by user")}>Mark as collected by user</Button>
                                                                                            :
                                                                                            <p className="text-green-600">Collected by user</p>
                                                                                    }
                                                                                    {/* <Select
                                            value={"not collected"}
                                            // onValueChange={(value) => handleSelectChange(item.id, value)}
                                          >
                                            <SelectTrigger id={`order-${order.product_id}`} className="col-span-3">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value={"not collected"}>Not collected</SelectItem>
                                              <SelectItem value={"collected"}>Collected</SelectItem>
                                            </SelectContent>
                                          </Select> */}
                                                                                </div>
                                                                            ))}
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p>No bookings for this date.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default VendorBookingManagement
