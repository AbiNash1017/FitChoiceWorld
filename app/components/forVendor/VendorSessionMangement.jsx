'use client'

import { useState, useEffect } from 'react'
import { Clock, Edit, Trash, Users, ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { useFitnessCentre } from '@/app/context/FitnessCentreContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'


const VendorSessionManagement = () => {
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const { fitnessCentreId } = useFitnessCentre()
    const [date, setDate] = useState(new Date())
    const [sessions, setSessions] = useState([])
    const [availabilities, setAvailabilities] = useState([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [newSession, setNewSession] = useState({
        category: '',
        duration: '',
        max_capacity: '',
        per_session_price: '',
        couple_session_price: '',
    });
    const [selectedSession, setSelectedSession] = useState({
        id: 0,
        category: '',
        duration: 0,
        max_capacity: 0,
        per_session_price: 0,
        couple_session_price: 0,
    });
    const [availabilityData, setAvailabilityData] = useState({
        days: [],
        startTime: '',
        endTime: '',
    })
    const [editAvailabilityData, setEditAvailabilityData] = useState({
        day: '',
        start_time: '',
        end_time: '',
        id: 0,
        session_id: 0
    })
    const [currentPage, setCurrentPage] = useState(1)
    // const [loading, setLoading] = useState(false) // useAuth has loading
    const itemsPerPage = 6
    const totalPages = sessions ? Math.ceil(sessions.length / itemsPerPage) : 1;
    const indexOfLastSession = currentPage * itemsPerPage
    const indexOfFirstSession = indexOfLastSession - itemsPerPage
    const currentSessions = sessions ? sessions.slice(indexOfFirstSession, indexOfLastSession) : [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber)
    const { user, loading } = useAuth()
    const [categories, setCategories] = useState([])
    const router = useRouter();

    const fetchSessions = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            console.log("in fetchsessions", fitnessCentreId);

            const response = await fetch(
                `/api/fitness-center/session?fitness_centre_id=${fitnessCentreId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                }
            );
            const data = await response.json();

            if (data.msg === 'Success' && Array.isArray(data.data)) {
                const sessions = data.data.map(({ Session_Availability, ...session }) => session);
                const availabilities = data.data
                    .flatMap(({ Session_Availability }) => Session_Availability || [])

                setSessions(sessions);
                setAvailabilities(availabilities);

                console.log("sess", sessions);
                console.log("av", availabilities);
            } else {
                console.log('No sessions found or error in response');
            }
        } catch (error) {
            console.log('Error fetching sessions:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/vendor/session/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        const data = await response.json()
        let responseMessage = data.message
        if (responseMessage === 'OK') {
            alert('Session deleted')
            fetchSessions()
        } else
            alert('Error deleting session!')
    }

    const handleDeleteAvailability = async (id) => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/vendor/availability/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        const data = await response.json()
        let responseMessage = data.message
        if (responseMessage === 'OK') {
            alert('Availability deleted')
            fetchSessions()
        } else
            alert('Error deleting availability!')
    }

    const addSession = async (e) => {
        e.preventDefault();
        console.log(newSession)
        const { category, duration, max_capacity, per_session_price, couple_session_price } = newSession;

        if (!category || !duration || !max_capacity || !per_session_price || !couple_session_price) {
            alert('Please fill all the required fields!');
            return;
        }

        if (!user) return;
        const token = await user.getIdToken();

        const response = await fetch(`/api/vendor/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                category,
                max_capacity: parseInt(max_capacity),
                per_session_price: parseFloat(per_session_price),
                couple_session_price: parseFloat(couple_session_price),
                duration: parseInt(duration),
            }),
        });

        const data = await response.json();
        console.log("reached")
        console.log(data.message)
        if (data.message === 'OK') {
            alert('Session added successfully!');
            setNewSession({
                category: '',
                duration: '',
                max_capacity: '',
                per_session_price: '',
                couple_session_price: '',
            });
            fetchSessions();
        } else {
            alert('Error adding session!');
        }
    };

    const editSession = async (e) => {
        e.preventDefault();

        const { id, category, duration, max_capacity, per_session_price, couple_session_price } = selectedSession;

        if (!category || !duration || !max_capacity || !per_session_price || !couple_session_price) {
            alert('Please fill all fields!');
            return;
        }

        if (!user) return;
        const token = await user.getIdToken();

        const response = await fetch(`/api/vendor/session/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                category,
                max_capacity: max_capacity,
                per_session_price: per_session_price,
                couple_session_price: couple_session_price,
                duration,
            }),
        });

        const data = await response.json();
        if (data.message === 'OK') {
            alert('Session updated successfully!');
            setIsEditModalOpen(false);
            fetchSessions();
        } else {
            alert('Error updating session!');
        }
    };

    const handleInputChange = (e) => {
        setNewSession({
            ...newSession,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvailabilityChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === 'days') {
            setAvailabilityData((prev) => ({
                ...prev,
                days: checked
                    ? [...prev.days, value]
                    : prev.days.filter((day) => day !== value),
            }));
        } else {
            setAvailabilityData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleEditAvailabilityChange = (e) => {
        const { name, value } = e.target;
        setEditAvailabilityData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddAvailability = async (e) => {
        e.preventDefault();
        if (availabilityData.days.length < 1 || !availabilityData.startTime || !availabilityData.endTime || !selectedSession?.id) {
            alert('Please fill all the required fields!');
            return;
        }
        const availabilityPayload = {
            availability: availabilityData.days.map((day) => ({
                day,
                start_time: availabilityData.startTime,
                end_time: availabilityData.endTime,
                session_id: selectedSession.id,
            })),
        };

        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/vendor/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(availabilityPayload),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Availability added successfully!');
                setIsEditModalOpen(false)
                setAvailabilityData({
                    days: [],
                    startTime: '',
                    endTime: '',
                });
                fetchSessions()
            } else
                alert('Error adding availability: ' + data.message);
        }
        catch (error) {
            console.error('Error adding availability:', error);
            alert('An error occurred while adding availability.');
        }
    };

    const handleEditAvailability = async (e) => {
        e.preventDefault();

        console.log(editAvailabilityData.day, editAvailabilityData.start_time, editAvailabilityData.end_time)
        const availabilityPayload = {
            availability: {
                day: editAvailabilityData.day,
                start_time: editAvailabilityData.start_time,
                end_time: editAvailabilityData.end_time
            },
        };
        console.log('Payload to send:', availabilityPayload);
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/vendor/availability/${editAvailabilityData.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(availabilityPayload),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Availability updated successfully!');
                setIsEditModalOpen(false)
                setEditAvailabilityData({
                    day: '',
                    start_time: '',
                    end_time: '',
                    id: 0,
                    session_id: 0
                });
                fetchSessions()
            } else
                alert('Error updating availability: ' + data.message);
        }
        catch (error) {
            console.error('Error updating availability:', error);
            alert('An error occurred while updating availability.');
        }
    };

    const fetchCategories = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/vendor/category`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();
            setCategories(data.data);
            console.log(categories)

        } catch (error) {
            console.log("Error fetching categories:", error);
        }
    }

    useEffect(() => {
        if (user) {
            fetchSessions()
            fetchCategories()
        }
    }, [user])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addSession} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="category">Category <span className='text-red-600 text-lg'>*</span></Label>
                                <Select name="category" onValueChange={(value) => setNewSession({ ...newSession, category: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="duration">Duration (minutes) <span className='text-red-600 text-lg'>*</span></Label>
                                <Input id="duration" name="duration" type="number" min="15" step="1" required value={newSession.duration} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="max_capacity">Max Capacity <span className='text-red-600 text-lg'>*</span></Label>
                                <Input id="max_capacity" name="max_capacity" type="number" min="1" required value={newSession.max_capacity} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="per_session_price">Price per Session<span className='text-red-600 text-lg'>*</span></Label>
                                <Input id="per_session_price" name="per_session_price" type="number" min="0" required value={newSession.per_session_price} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="couple_session_price">Couples Session Price<span className='text-red-600 text-lg'>*</span></Label>
                                <Input id="couple_session_price" name="couple_session_price" type="number" min="0" required value={newSession.couple_session_price} onChange={handleInputChange} />
                            </div>
                        </div>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Add Session</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    {
                        loading ? (<div><Loader className='h-8 w-8 animate-spin' /></div>) : (
                            <><div className="space-y-4">
                                {currentSessions.map((session, ind) => (
                                    <div key={session.id} className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold">{session.category}</h4>
                                            <div className='flex flex-row gap-3'>
                                                <p className="text-sm text-gray-500">Duration: {session.duration} minutes</p>
                                                <p className="text-sm text-gray-500">Capacity: {session.max_capacity}</p>
                                                <p className="text-sm text-gray-500">Price: {session.per_session_price}</p>
                                                <p className="text-sm text-gray-500">Couples Session Price: {session.couple_session_price}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Availability
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add Availability for {selectedSession?.category}</DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={handleAddAvailability} className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                                <div key={day} className="flex items-center space-x-2">
                                                                    <Input
                                                                        type='checkbox'
                                                                        id={day.toLowerCase()}
                                                                        name="days"
                                                                        value={day.toLowerCase()}
                                                                        onChange={(e) => handleAvailabilityChange(e)}
                                                                        className='h-4 w-4' />
                                                                    <label htmlFor={day.toLowerCase()}>{day}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="startTime">Start Time</Label>
                                                            <Input id="startTime" name="startTime" type="time" required value={availabilityData.startTime} onChange={handleAvailabilityChange} />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="endTime">End Time</Label>
                                                            <Input id="endTime" name="endTime" type="time" required value={availabilityData.endTime} onChange={handleAvailabilityChange} />
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Add Availability</Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Session: {selectedSession?.category}</DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={editSession} className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label htmlFor="edit-category">Category</Label>
                                                                <Select value={selectedSession?.category || ""} onValueChange={(value) => setSelectedSession({ ...selectedSession, category: value })}>
                                                                    <SelectTrigger id="edit-category">
                                                                        <SelectValue placeholder="Select a category" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {categories?.map((category) => (
                                                                            <SelectItem key={category.id} value={category.name}>
                                                                                {category.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                                                                <Input id="edit-duration" name="duration" type="number" min="15" step="1" value={selectedSession?.duration || ""} onChange={(e) => setSelectedSession({ ...selectedSession, duration: parseInt(e.target.value) })} required />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-max_capacity">Max Capacity</Label>
                                                                <Input id="edit-max_capacity" name="max_capacity" type="number" min="1" value={selectedSession?.max_capacity || ""} onChange={(e) => setSelectedSession({ ...selectedSession, max_capacity: parseInt(e.target.value) })} required />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-per_session_price">Price per Session</Label>
                                                                <Input id="edit-per_session_price" name="per_session_price" type="number" min="0" value={selectedSession?.per_session_price || ""} onChange={(e) => setSelectedSession({ ...selectedSession, per_session_price: parseFloat(e.target.value) })} required />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-couple_session_price">Couples Session Price</Label>
                                                                <Input id="edit-couple_session_price" name="couple_session_price" type="number" min="0" value={selectedSession?.couple_session_price || ""} onChange={(e) => setSelectedSession({ ...selectedSession, couple_session_price: parseFloat(e.target.value) })} required />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button onClick={() => { setIsEditModalOpen(false) }} type="submit" className="bg-red-600 hover:bg-red-700 text-white">Save Changes</Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Trash className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure you want to delete this session?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the session.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => { handleDelete(session.id) }} className="bg-red-600 hover:bg-red-700 text-white">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div><div className="flex justify-center mt-4 space-x-2">
                                    <Button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <Button
                                            key={i + 1}
                                            onClick={() => paginate(i + 1)}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            className={currentPage === i + 1 ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div></>
                        )
                    }
                </CardContent>
            </Card>

            <Card className="p-4">
                <CardHeader className="p-0 pb-4">
                    <CardTitle>Session Calendar</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="w-full lg:w-1/4 flex justify-center items-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="w-full lg:w-3/4">
                            <h3 className="text-lg font-semibold mb-2">Sessions for {date?.toDateString()}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availabilities && availabilities.length > 0 ? (
                                    availabilities
                                        .filter(availability => {
                                            const dayName = date
                                                ? date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
                                                : null;
                                            // console.log("Selected day name:", dayName); 
                                            // console.log("Availability day:", availability.day);               
                                            return (
                                                dayName && availability.day.toLowerCase() === dayName
                                            );
                                        })
                                        .map(availability => {
                                            // console.log("Availability ID:", availability.id);
                                            // console.log("Session ID from availability:", availability.session_id);
                                            const session = sessions.find(
                                                s => s.id === availability.session_id
                                            );
                                            if (!session) {
                                                console.warn(
                                                    `No session found for availability ID: ${availability.id}`
                                                );
                                                return null;
                                            }
                                            return (
                                                <Card
                                                    key={availability.id}
                                                    className="group relative hover:bg-[#d3d0d0] transition-colors"
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-semibold">{session.category}</h4>
                                                                <div className="text-gray-500 flex items-center">
                                                                    <Clock className="w-3 h-3 mr-1" />{" "}
                                                                    {availability.start_time} - {availability.end_time}
                                                                </div>
                                                                <div className="text-gray-500 flex items-center">
                                                                    <Users className="w-3 h-3 mr-1" />{" "}
                                                                    {session.max_capacity} max
                                                                </div>
                                                            </div>
                                                            <div className="font-semibold">
                                                                &#8377; {session.per_session_price}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => setEditAvailabilityData(availability)} >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Edit Availability</DialogTitle>
                                                                </DialogHeader>
                                                                <form onSubmit={handleEditAvailability} className="space-y-4">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                                            <div key={day} className="flex items-center space-x-2">
                                                                                <Input
                                                                                    type='checkbox'
                                                                                    id={day.toLowerCase()}
                                                                                    name="days"
                                                                                    value={day.toLowerCase()}
                                                                                    onChange={(e) => setEditAvailabilityData({ ...editAvailabilityData, day: e.target.value })}
                                                                                    className='h-4 w-4' />
                                                                                <label htmlFor={day.toLowerCase()}>{day}</label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="startTime">Start Time</Label>
                                                                        <Input id="startTime" name="startTime" type="time" required value={editAvailabilityData.start_time} onChange={(e) => setEditAvailabilityData({ ...editAvailabilityData, start_time: e.target.value })} />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="endTime">End Time</Label>
                                                                        <Input id="endTime" name="endTime" type="time" required value={editAvailabilityData.end_time} onChange={(e) => setEditAvailabilityData({ ...editAvailabilityData, end_time: e.target.value })} />
                                                                    </div>
                                                                    <DialogFooter>
                                                                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Update Availability</Button>
                                                                    </DialogFooter>
                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash className="w-4 h-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure you want to delete this session?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the session.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => { handleDeleteAvailability(availability.id) }} className="bg-red-600 hover:bg-red-700 text-white">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </Card>
                                            );
                                        })
                                ) : (
                                    <p>No availability available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default VendorSessionManagement
