import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import FitnessCenter from '@/lib/models/fitnessCenters';

export async function POST(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const body = await request.json();

        await dbConnect();

        // Validate required fields
        if (!body.centre_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const latitude = body.latitude ? parseFloat(body.latitude) : 0;
        const longitude = body.longitude ? parseFloat(body.longitude) : 0;

        const newFitnessCenter = new FitnessCenter({
            name: body.centre_name,
            owner_id: uid,
            description: body.centre_description,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude], // GeoJSON expects [longitude, latitude]
            },
            address: body.address,
            city: body.city,
            state: body.state,
            postal_code: body.pincode,
            phone_number: body.contact_no,
            subscription_plan_id: body.plan_id,
            country: 'India', // Defaulting to India as per context
            is_active: true,
        });

        await newFitnessCenter.save();

        return NextResponse.json({
            message: 'OK',
            fitnessCenter: newFitnessCenter,
            nextStep: '/vendor/dashboard'
        });
    } catch (error) {
        console.error('Error creating fitness center:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
