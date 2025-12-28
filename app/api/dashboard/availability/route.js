import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Facility from '@/lib/models/facilities';

const DAY_MAPPING = [
    'DAY_OF_WEEK_SUNDAY',
    'DAY_OF_WEEK_MONDAY',
    'DAY_OF_WEEK_TUESDAY',
    'DAY_OF_WEEK_WEDNESDAY',
    'DAY_OF_WEEK_THURSDAY',
    'DAY_OF_WEEK_FRIDAY',
    'DAY_OF_WEEK_SATURDAY'
];

export async function POST(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        await dbConnect();

        const body = await request.json();
        const { availability } = body;

        if (!availability || !Array.isArray(availability) || availability.length === 0) {
            return NextResponse.json({ message: 'No availability data provided' }, { status: 400 });
        }

        const sessionId = availability[0].session_id;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID missing in availability data' }, { status: 400 });
        }

        const facility = await Facility.findById(sessionId);
        if (!facility) {
            return NextResponse.json({ error: 'Facility Session not found' }, { status: 404 });
        }

        // Group slots by Day of Week
        const scheduleMap = {};

        availability.forEach(slot => {
            const date = new Date(slot.day);
            const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday...
            const dayEnum = DAY_MAPPING[dayIndex];

            if (!scheduleMap[dayEnum]) {
                scheduleMap[dayEnum] = [];
            }

            scheduleMap[dayEnum].push({
                start_time: slot.start_time, // e.g., "14:00"
                // Assuming start_time_utc and end_time_utc are expected by schema or frontend later, 
                // but schema has start_time/end_time as String. We'll stick to schema.
                // If user example showed start_time_utc, we might need to change, but schema says start_time String.
                // Waiting for user correction if needed, but schema in file view was start_time: String.
                end_time: slot.end_time,
                capacity: slot.capacity || facility.capacity,
                price: slot.price || facility.price_per_slot,
                instructor_id: facility.instructor_id,
                instructor_name: facility.instructor_name
            });
        });

        const newSchedules = Object.keys(scheduleMap).map(dayEnum => ({
            day: dayEnum,
            is_available: true,
            time_slots: scheduleMap[dayEnum]
        }));

        // We want to merge with existing schedules or replace?
        // Since this is likely a fresh creation flow, push is okay.
        // Ideally we should check if 'DAY_OF_WEEK_MONDAY' exists and merge slots, 
        // but to keep it simple and functional for "Create", we will push.

        // Actually, to avoid duplicates if they click save multiple times for same day:
        // We will pull existing for these days and then push new.

        await Facility.findByIdAndUpdate(sessionId, {
            $pull: { 'schedule.schedules': { day: { $in: Object.keys(scheduleMap) } } }
        });

        await Facility.findByIdAndUpdate(sessionId, {
            $push: { 'schedule.schedules': { $each: newSchedules } }
        });

        return NextResponse.json({ message: 'Schedule updated successfully' });

    } catch (error) {
        console.error('Error adding availability:', error);
        if (error.name === 'ValidationError') {
            console.error("Validation Error Details:", JSON.stringify(error.errors, null, 2));
        }
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
