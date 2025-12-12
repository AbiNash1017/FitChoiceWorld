import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Facility from '@/lib/models/facilities';
import User from '@/lib/models/User';

// GET: Fetch existing session by Type for the current vendor
export async function GET(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        await dbConnect();
        const user = await User.findOne({ uid });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');


        const fitness_center_id = searchParams.get('fitness_center_id');

        if (!type || !fitness_center_id) {
            return NextResponse.json({ error: 'Type and Fitness Center ID required' }, { status: 400 });
        }

        const facility = await Facility.findOne({
            fitness_center_id: fitness_center_id,
            type: type
        });

        if (!facility) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'OK', data: facility });

    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update existing session
export async function PUT(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        await dbConnect();

        const body = await request.json();
        const { session_id, ...updates } = body;

        if (!session_id) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const updatedFacility = await Facility.findByIdAndUpdate(
            session_id,
            {
                $set: {
                    ...updates,
                    // Ensure numeric fields are parsed if needed, or assume frontend sent correct types.
                    // Schema allows updates.
                    updated_at: new Date()
                }
            },
            { new: true }
        );

        if (!updatedFacility) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'OK', data: updatedFacility });
    } catch (error) {
        console.error('Error updating session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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

        // CHECK UNIQUENESS: If session exists with this type & center, block create or auto-update?
        // User asked: "if i ahev already meade one session ... edit in it and the same document should egt edit no different document should be formed"
        // Frontend should handle the switch to PUT, but double check here.
        const existing = await Facility.findOne({ fitness_center_id, type });
        if (existing) {
            // Return conflict with ID so frontend can switch to edit mode? 
            // Or just update it?
            // "Restful" says POST is create. But to be safe, if exists, return error or handle it.
            // Let's return error 409 Conflict with data so frontend knows.
            return NextResponse.json({
                error: 'Session of this type already exists. Please edit instead.',
                existing_id: existing._id
            }, { status: 409 });
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
