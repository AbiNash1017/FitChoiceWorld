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
        const {
            session_id,
            price_per_slot,
            per_session_price,
            min_no_of_slots,
            ...updates
        } = body;

        if (!session_id) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Normalize fields
        const updatesToApply = { ...updates };

        // Fix Price
        if (price_per_slot !== undefined) updatesToApply.price_per_slot = price_per_slot;
        else if (per_session_price !== undefined) updatesToApply.price_per_slot = per_session_price;

        // Sync capacity if slots change
        if (min_no_of_slots !== undefined) {
            updatesToApply.min_no_of_slots = min_no_of_slots;
            updatesToApply.capacity = min_no_of_slots;
        }

        const updatedFacility = await Facility.findByIdAndUpdate(
            session_id,
            {
                $set: {
                    ...updatesToApply,
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

        // Destructure common fields.
        // Support both Frontend naming (per_session_price) and Schema naming (price_per_slot)
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
            price_per_slot, // Add this
            couple_session_price,
            fitness_center_id
        } = body;

        // Normalize price
        const finalPrice = price_per_slot !== undefined ? price_per_slot : per_session_price;

        if (!fitness_center_id) {
            return NextResponse.json({ error: 'Fitness Center ID is required' }, { status: 400 });
        }

        // CHECK UNIQUENESS
        const existing = await Facility.findOne({ fitness_center_id, type });
        if (existing) {
            return NextResponse.json({
                error: 'Session of this type already exists. Please edit instead.',
                existing_id: existing._id
            }, { status: 409 });
        }

        // Default image logic
        const defaultImage = "https://thumbs.dreamstime.com/b/latina-dancing-zumba-latin-fitness-girl-exercising-motion-blur-78887627.jpg";

        const newFacility = new Facility({
            fitness_center_id,
            type,
            name,
            description,
            image_urls: [defaultImage],
            equipment: Array.isArray(equipment) ? equipment : [],
            instructor_id: user._id,
            instructor_name: instructor_name,
            instructor_profile_image: user.photo_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR43TnXOwFvrZ3LLj…",
            requires_booking,
            duration_minutes,
            capacity: min_no_of_slots, // Sync capacity with min_no_of_slots for now
            min_no_of_slots,
            icon_image_url: defaultImage,
            max_advance_booking_days,
            min_advance_booking_hours,
            price_per_slot: finalPrice, // Use normalized price
            couple_session_price,
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
