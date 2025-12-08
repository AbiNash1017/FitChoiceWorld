'use client'

import { useState } from 'react'
import { Plus, X, Trash2, Clock, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { useFitnessCentre } from '@/app/context/FitnessCentreContext'
import { useAuth } from '@/app/context/AuthContext'
import { format } from 'date-fns'

const VendorSessionManagement = () => {
    const { fitnessCentreId } = useFitnessCentre()
    const { user, loading } = useAuth()

    // Session State
    const [isSaving, setIsSaving] = useState(false);
    const [newSession, setNewSession] = useState({
        type: '',
        name: '',
        description: '',
        duration_minutes: '',
        min_no_of_slots: '',
        max_advance_booking_days: 30,
        min_advance_booking_hours: 2,
        instructor_name: '',
        requires_booking: true,
        equipment: [],
        per_session_price: '',
        couple_session_price: '',
    });

    // Schedule State
    // Format: { 'yyyy-MM-dd': [{ start_time: 'HH:mm', end_time: 'HH:mm' }, ...] }
    const [schedules, setSchedules] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentSlot, setCurrentSlot] = useState({ start_time: '', end_time: '' });

    // Equipment input
    const [equipmentInput, setEquipmentInput] = useState('');

    const facilityTypes = [
        { label: "GYM", value: "FACILITY_TYPE_GYM" },
        { label: "YOGA", value: "FACILITY_TYPE_YOGA" },
        { label: "ZUMBA", value: "FACILITY_TYPE_ZUMBA" },
        { label: "PERSONAL TRAINING", value: "FACILITY_TYPE_PERSONAL_TRAINING" },
        { label: "SWIMMING", value: "FACILITY_TYPE_SWIMMING" }
    ];



    const handleAddEquipment = () => {
        if (equipmentInput.trim()) {
            setNewSession(prev => ({
                ...prev,
                equipment: [...prev.equipment, equipmentInput.trim()]
            }));
            setEquipmentInput('');
        }
    };

    const handleRemoveEquipment = (index) => {
        setNewSession(prev => ({
            ...prev,
            equipment: prev.equipment.filter((_, i) => i !== index)
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewSession({
            ...newSession,
            [name]: type === 'checkbox' ? (name === 'requires_booking' ? checked : value) : value,
        });
    };

    // Schedule Handlers
    const handleAddSlot = () => {
        if (!currentSlot.start_time || !currentSlot.end_time || !selectedDate) {
            alert("Please select a start and end time.");
            return;
        }

        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const existingSlots = schedules[dateKey] || [];

        setSchedules({
            ...schedules,
            [dateKey]: [...existingSlots, currentSlot]
        });

        // Reset current slot inputs
        setCurrentSlot({ start_time: '', end_time: '' });
    };

    const handleRemoveSlot = (dateKey, index) => {
        const updatedSlots = schedules[dateKey].filter((_, i) => i !== index);
        if (updatedSlots.length === 0) {
            const newSchedules = { ...schedules };
            delete newSchedules[dateKey];
            setSchedules(newSchedules);
        } else {
            setSchedules({
                ...schedules,
                [dateKey]: updatedSlots
            });
        }
    };

    const addSession = async (e) => {
        e.preventDefault();

        const {
            type, name, description, duration_minutes, min_no_of_slots,
            max_advance_booking_days, min_advance_booking_hours,
            instructor_name, equipment, per_session_price, couple_session_price
        } = newSession;

        // Validation
        if (!type || !name || !description || !duration_minutes || !min_no_of_slots ||
            !instructor_name || !per_session_price) {
            alert('Please fill all the required session fields!');
            return;
        }

        if (Object.keys(schedules).length === 0) {
            alert('Please add at least one schedule slot!');
            return;
        }

        if (!user) return;
        setIsSaving(true);
        const token = await user.getIdToken();

        // 1. Create Session Payload
        const sessionPayload = {
            type,
            name,
            description,
            equipment,
            instructor_name,
            requires_booking: newSession.requires_booking,
            duration_minutes: parseInt(duration_minutes),
            min_no_of_slots: parseInt(min_no_of_slots),
            max_advance_booking_days: parseInt(max_advance_booking_days || 30),
            min_advance_booking_hours: parseInt(min_advance_booking_hours || 2),
            per_session_price: parseFloat(per_session_price),
            couple_session_price: parseFloat(couple_session_price || 0),
            fitness_center_id: fitnessCentreId
        };

        try {
            // Step 1: Create Session
            const sessionResponse = await fetch(`/api/vendor/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(sessionPayload),
            });

            const sessionData = await sessionResponse.json();

            if (!sessionResponse.ok || (sessionData.message !== 'OK' && !sessionData._id && !sessionData.id && !sessionData.data)) {
                throw new Error(sessionData.message || sessionData.error || 'Failed to create session');
            }

            const newSessionId = sessionData._id || sessionData.id || sessionData.data?._id;

            if (!newSessionId) {
                throw new Error('Session created but no ID returned. Cannot add schedule.');
            }

            // Step 2: Transform Schedules for API
            // Flatten the schedules object into an array of availability objects
            // The API likely expects 'day' to be the date string now based on this new usage
            const availabilityList = Object.entries(schedules).flatMap(([dateStr, slots]) =>
                slots.map(slot => ({
                    day: dateStr, // Sending YYYY-MM-DD as 'day'
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    session_id: newSessionId
                }))
            );

            const availabilityPayload = {
                availability: availabilityList
            };

            const availabilityResponse = await fetch(`/api/vendor/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(availabilityPayload),
            });

            const availabilityResData = await availabilityResponse.json();

            if (availabilityResponse.ok) {
                alert('Session and Schedule added successfully!');
                // Reset Form
                setNewSession({
                    type: '', name: '', description: '', duration_minutes: '', min_no_of_slots: '',
                    max_advance_booking_days: 30, min_advance_booking_hours: 2, instructor_name: '',
                    requires_booking: true, equipment: [], per_session_price: '', couple_session_price: '',
                });
                setSchedules({});
                setEquipmentInput('');
            } else {
                alert(`Session created, but failed to add schedule: ${availabilityResData.message}`);
            }

        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
    const selectedDateSlots = selectedDateKey ? (schedules[selectedDateKey] || []) : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Facility Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addSession} className="space-y-6">

                        {/* --- Basic Session Info --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Facility Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Facility Type <span className='text-red-600'>*</span></Label>
                                <Select name="type" value={newSession.type} onValueChange={(value) => setNewSession({ ...newSession, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facilityTypes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Session Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Session Name <span className='text-red-600'>*</span></Label>
                                <Input id="name" name="name" placeholder="e.g. Morning Zumba" required value={newSession.name} onChange={handleInputChange} />
                            </div>

                            {/* Instructor Name */}
                            <div className="space-y-2">
                                <Label htmlFor="instructor_name">Instructor Name <span className='text-red-600'>*</span></Label>
                                <Input id="instructor_name" name="instructor_name" required value={newSession.instructor_name} onChange={handleInputChange} />
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="duration_minutes">Duration (minutes) <span className='text-red-600'>*</span></Label>
                                <Input id="duration_minutes" name="duration_minutes" type="number" min="15" required value={newSession.duration_minutes} onChange={handleInputChange} />
                            </div>

                            {/* Min Slots */}
                            <div className="space-y-2">
                                <Label htmlFor="min_no_of_slots">Min Slots <span className='text-red-600'>*</span></Label>
                                <Input id="min_no_of_slots" name="min_no_of_slots" type="number" min="1" required value={newSession.min_no_of_slots} onChange={handleInputChange} />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="per_session_price">Price per Session <span className='text-red-600'>*</span></Label>
                                <Input id="per_session_price" name="per_session_price" type="number" min="0" required value={newSession.per_session_price} onChange={handleInputChange} />
                            </div>

                            {/* Couple Price */}
                            <div className="space-y-2">
                                <Label htmlFor="couple_session_price">Couples Price (Optional)</Label>
                                <Input id="couple_session_price" name="couple_session_price" type="number" min="0" value={newSession.couple_session_price} onChange={handleInputChange} />
                            </div>

                            {/* Requires Booking Checkbox */}
                            <div className="flex items-center space-x-2 pt-8">
                                <Input
                                    id="requires_booking"
                                    name="requires_booking"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={newSession.requires_booking}
                                    onChange={handleInputChange}
                                />
                                <Label htmlFor="requires_booking">Requires Booking</Label>
                            </div>
                        </div>

                        {/* Booking Rules */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border">
                            <h3 className="col-span-full font-semibold text-gray-700">Booking Rules</h3>
                            <div className="space-y-2">
                                <Label htmlFor="max_advance_booking_days" className="text-sm text-gray-600">Max Advance Booking (Days)</Label>
                                <Input id="max_advance_booking_days" name="max_advance_booking_days" type="number" min="1" value={newSession.max_advance_booking_days} onChange={handleInputChange} className="bg-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_advance_booking_hours" className="text-sm text-gray-600">Min Advance Booking (Hours)</Label>
                                <Input id="min_advance_booking_hours" name="min_advance_booking_hours" type="number" min="0" value={newSession.min_advance_booking_hours} onChange={handleInputChange} className="bg-white" />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className='text-red-600'>*</span></Label>
                            <Textarea id="description" name="description" required value={newSession.description} onChange={handleInputChange} />
                        </div>

                        {/* Equipment */}
                        <div className="space-y-2">
                            <Label>Equipment Provided</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={equipmentInput}
                                    onChange={(e) => setEquipmentInput(e.target.value)}
                                    placeholder="Add equipment (e.g. Yoga Mat)"
                                />

                                <Button type="button" onClick={handleAddEquipment} variant="outline" className="bg-black px-4 text-white">
                                    <Plus className="h-4 w-4" />
                                    <span>Add</span>
                                </Button>
                            </div>
                            {newSession.equipment.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newSession.equipment.map((item, index) => (
                                        <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                                            <span>{item}</span>
                                            <button type="button" onClick={() => handleRemoveEquipment(index)} className="text-gray-500 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- Advanced Calendar Schedule Section --- */}
                        <div className="space-y-4 pt-6 border-t font-sans">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">Session Schedule</h3>
                                    <p className="text-sm text-muted-foreground">Select a date to manage time slots.</p>
                                </div>
                                <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                                    {Object.keys(schedules).length} days configured
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Calendar Column */}
                                <div className="p-4 border rounded-lg bg-white shadow-sm flex-shrink-0 w-full md:w-auto flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        className="rounded-md border p-3 pointer-events-auto"
                                        classNames={{
                                            day: "h-9 w-9 px-4 font-normal aria-selected:opacity-100 rounded-full transition-colors",
                                            day_selected: "bg-red-600 text-white hover:bg-red-700 hover:text-white focus:bg-red-700 focus:text-white", // 👈 CHANGED THIS LINE
                                            day_today: "bg-slate-100 text-slate-900",
                                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 pl-3", // Increased pl-1 to pl-3 to shift dates right
                                        }}
                                        // Highlight days that have schedules
                                        modifiers={{
                                            hasSchedule: (date) => !!schedules[format(date, 'yyyy-MM-dd')]
                                        }}
                                        modifiersStyles={{
                                            hasSchedule: { fontWeight: 'bold', textDecoration: 'underline', color: '#dc2626' }
                                        }}
                                    />
                                </div>

                                {/* Slots Column */}
                                <div className="flex-1 w-full space-y-4">
                                    {selectedDate ? (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all duration-300 ease-in-out">
                                            <h4 className="font-semibold text-lg mb-4 flex items-center">
                                                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                                                Slots for {format(selectedDate, 'MMMM do, yyyy')}
                                            </h4>

                                            {/* Existing Slots for this day */}
                                            {selectedDateSlots.length > 0 ? (
                                                <div className="space-y-2 mb-6">
                                                    {selectedDateSlots.map((slot, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <span className="font-medium text-gray-700">{slot.start_time} - {slot.end_time}</span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRemoveSlot(selectedDateKey, idx)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic mb-6">No slots added for this date yet.</p>
                                            )}

                                            {/* Add New Slot Inputs */}
                                            {/* Add New Slot Inputs - Redesign */}
                                            <div className="mt-6 pt-4 border-t border-gray-100">
                                                <Label className="text-sm font-medium text-gray-700 mb-3 block">Add New Time Slot</Label>
                                                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex items-center gap-3">
                                                    <div className="grid grid-cols-2 gap-3 flex-1">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">From</span>
                                                            <Input
                                                                type="time"
                                                                value={currentSlot.start_time}
                                                                onChange={(e) => setCurrentSlot({ ...currentSlot, start_time: e.target.value })}
                                                                className="pl-12 text-center font-medium bg-gray-50 focus:bg-white transition-colors h-10 border-gray-200"
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">To</span>
                                                            <Input
                                                                type="time"
                                                                value={currentSlot.end_time}
                                                                onChange={(e) => setCurrentSlot({ ...currentSlot, end_time: e.target.value })}
                                                                className="pl-8 text-center font-medium bg-gray-50 focus:bg-white transition-colors h-10 border-gray-200"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddSlot}
                                                        className="bg-black hover:bg-gray-800 text-white h-10 px-4 shadow-sm transition-all flex items-center gap-2"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        <span>Add</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 border-2 border-dashed rounded-lg p-8">
                                            Select a date to configure slots
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={isSaving} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg mt-8 disabled:bg-red-400">
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Session and Schedule"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}

export default VendorSessionManagement