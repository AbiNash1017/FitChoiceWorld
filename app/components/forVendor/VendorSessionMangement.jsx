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
import TimePickerWheel from "@/components/ui/time-picker-wheel"
import { cn } from "@/lib/utils"
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
    // Format: { '0': [{ start_time: 'HH:mm', end_time: 'HH:mm' }], ... } // 0 = Sunday, 1 = Monday
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

    // --- Helper for Time Calculation ---
    const calculateEndTime = (startTimeStr, durationMinutes) => {
        if (!startTimeStr || !durationMinutes) return '';

        // Parse "hh:mm AA"
        const [time, period] = startTimeStr.split(' ');
        if (!time || !period) return '';

        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        // Add duration
        const totalMinutes = hours * 60 + minutes + parseInt(durationMinutes);

        // Convert back
        const endHours24 = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;

        const periodNew = endHours24 >= 12 ? 'PM' : 'AM';
        let displayHours = endHours24 % 12;
        if (displayHours === 0) displayHours = 12;

        return `${displayHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${periodNew}`;
    };

    // Schedule Handlers
    const handleStartTimeChange = (newStartTime) => {
        const updatedEndTime = calculateEndTime(newStartTime, newSession.duration_minutes);
        setCurrentSlot(prev => ({
            ...prev,
            start_time: newStartTime,
            end_time: updatedEndTime || prev.end_time // Auto-set end time if calculation possible
        }));
    };

    const handleAddSlot = () => {
        if (!currentSlot.start_time || !currentSlot.end_time || !selectedDate) {
            alert("Please select a start and end time.");
            return;
        }

        const dayIndex = selectedDate.getDay(); // 0-6
        const existingSlots = schedules[dayIndex] || [];

        setSchedules({
            ...schedules,
            [dayIndex]: [...existingSlots, currentSlot]
        });

        // Reset current slot inputs
        setCurrentSlot({ start_time: '', end_time: '' });
    };

    const handleRemoveSlot = (dayIndex, index) => {
        const updatedSlots = schedules[dayIndex].filter((_, i) => i !== index);
        if (updatedSlots.length === 0) {
            const newSchedules = { ...schedules };
            delete newSchedules[dayIndex];
            setSchedules(newSchedules);
        } else {
            setSchedules({
                ...schedules,
                [dayIndex]: updatedSlots
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
            // The API interprets 'day' to extract the DAY_OF_WEEK.
            // We map our generic day indices (0-6) to a representative date string (e.g., the next upcoming occurrence)
            // so the backend can correctly extract the weekday.

            const getRepresentativeDate = (dayIndexStr) => {
                const dayIndex = parseInt(dayIndexStr);
                const today = new Date();
                const currentDay = today.getDay(); // 0-6
                let daysUntil = (dayIndex - currentDay + 7) % 7;
                // We use 'daysUntil' to find the next date corresponding to this dayIndex.
                // It doesn't matter WHICH date it is, as long as it's the correct day of the week.
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + daysUntil);
                return format(nextDate, 'yyyy-MM-dd');
            }

            const availabilityList = Object.entries(schedules).flatMap(([dayIndex, slots]) => {
                const representativeDate = getRepresentativeDate(dayIndex);
                return slots.map(slot => ({
                    day: representativeDate,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    duration_minutes: parseInt(duration_minutes), // Send duration
                    session_id: newSessionId
                }));
            });

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

    const selectedDayIndex = selectedDate ? selectedDate.getDay() : null;
    const selectedDateSlots = selectedDayIndex !== null ? (schedules[selectedDayIndex] || []) : [];

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

                        {/* --- Advanced Schedule Builder Section --- */}
                        <div className="space-y-4 pt-6 border-t font-sans">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">Session Schedule</h3>
                                    <p className="text-sm text-muted-foreground">Select a day and configure booking hours.</p>
                                </div>
                                <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                                    {Object.keys(schedules).length} days configured
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Left Column: Scheduler Controls (Replaces Calendar) */}
                                <div className="w-full lg:w-auto p-6 border rounded-2xl bg-white shadow-sm flex flex-col gap-6 items-center">

                                    {/* Day Selector */}
                                    <div className="w-full">
                                        <Label className="text-sm font-semibold text-gray-700 mb-3 block text-center">Select Day</Label>
                                        <div className="flex justify-between gap-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                                const isSelected = selectedDate && selectedDate.getDay() === idx;
                                                const hasSchedule = schedules[idx] && schedules[idx].length > 0;
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            // We need a date for this index. 
                                                            // We can just use a dummy date or update 'selectedDate' to next occurrence.
                                                            const today = new Date();
                                                            const currentDay = today.getDay();
                                                            const daysUntil = (idx - currentDay + 7) % 7;
                                                            const nextDate = new Date(today);
                                                            nextDate.setDate(today.getDate() + daysUntil);
                                                            setSelectedDate(nextDate);
                                                        }}
                                                        className={cn(
                                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                                            isSelected
                                                                ? "bg-black text-white scale-110 shadow-md"
                                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                                                            hasSchedule && !isSelected && "ring-2 ring-red-500 ring-offset-1 text-red-600 bg-red-50"
                                                        )}
                                                    >
                                                        {day}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="w-full flex justify-center gap-6">
                                        {/* Start Time */}
                                        <div className="flex flex-col items-center gap-2">
                                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Time</Label>
                                            <TimePickerWheel
                                                value={currentSlot.start_time}
                                                onChange={handleStartTimeChange}
                                            />
                                        </div>

                                        {/* End Time */}
                                        <div className="flex flex-col items-center gap-2">
                                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">End Time</Label>
                                            <TimePickerWheel
                                                value={currentSlot.end_time}
                                                onChange={(v) => setCurrentSlot(prev => ({ ...prev, end_time: v }))}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleAddSlot}
                                        className="w-full bg-black hover:bg-gray-800 text-white h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-md font-medium"
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span>Add Time Slot</span>
                                    </Button>

                                </div>

                                {/* Right Column: Existing Slots List */}
                                <div className="flex-1 w-full space-y-4">
                                    {selectedDate ? (
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transition-all duration-300 min-h-[400px]">
                                            <h4 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                                                <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                                                    <Clock className="w-5 h-5 text-red-500" />
                                                </div>
                                                {format(selectedDate, 'EEEE')} Schedule
                                            </h4>

                                            {/* Existing Slots for this day */}
                                            {selectedDateSlots.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedDateSlots.map((slot, idx) => (
                                                        <div key={idx} className="group flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                            <div className='flex items-center gap-3'>
                                                                <div className='w-2 h-2 rounded-full bg-green-500'></div>
                                                                <span className="font-bold text-gray-700 text-lg tracking-tight">
                                                                    {slot.start_time}
                                                                    <span className='text-gray-300 mx-2 font-normal'>—</span>
                                                                    {slot.end_time}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleRemoveSlot(selectedDayIndex, idx)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                    <Clock className="w-12 h-12 mb-2 opacity-20" />
                                                    <p className="text-sm font-medium">No slots added yet</p>
                                                    <p className="text-xs opacity-60">Use the wheels to add booking hours</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 border-2 border-dashed rounded-lg p-8">
                                            Select a day to configure
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