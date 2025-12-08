import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Facility from '@/lib/models/facilities';
import User from '@/lib/models/User';

export async function POST(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        await dbConnect();

        // Get user for instructor info
        const user = await User.findOne({ uid });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();

        const {
            type,
            name,
            description,
            equipment,
            instructor_name,
            requires_booking,
            duration_minutes,
            min_no_of_slots,
            max_advance_booking_days,
            min_advance_booking_hours,
            per_session_price,
            couple_session_price,
            fitness_center_id
        } = body;

        if (!fitness_center_id) {
            return NextResponse.json({ error: 'Fitness Center ID is required' }, { status: 400 });
        }

        // Default image logic
        const defaultImage = "https://thumbs.dreamstime.com/b/latina-dancing-zumba-latin-fitness-girl-exercising-motion-blur-78887627.jpg"; // Placeholder based on user's hint or generic

        const newFacility = new Facility({
            fitness_center_id,
            type, // FRONTEND MUST SEND CORRECT ENUM VALUE e.g. "FACILITY_TYPE_ZUMBA" if schema enforces enum, otherwise string. Schema says String, so "ZUMBA" or "FACILITY_TYPE_ZUMBA" is fine depending on validation elsewhere.
            name,
            description,
            image_urls: [defaultImage], // Set default image
            equipment: Array.isArray(equipment) ? equipment : [],
            instructor_id: user._id, // Set instructor ID
            instructor_name: instructor_name,
            instructor_profile_image: user.photo_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR43TnXOwFvrZ3LLj…", // Use user photo or default
            requires_booking,
            duration_minutes,
            capacity: min_no_of_slots,
            min_no_of_slots, // Added field
            icon_image_url: defaultImage, // Using same default image for icon
            max_advance_booking_days,
            min_advance_booking_hours,
            price_per_slot: per_session_price,
            updated_by: user._id,
            is_active: true
        });

        await newFacility.save();

        return NextResponse.json({ message: 'OK', data: newFacility });

    } catch (error) {
        console.error('Error creating facility session:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
