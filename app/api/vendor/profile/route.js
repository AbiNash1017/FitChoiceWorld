import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import FitnessCenter from '@/lib/models/fitnessCenters';

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

        // Fetch user profile
        const userProfile = await User.findOne({ uid });

        // Fetch fitness center
        const fitnessCenter = await FitnessCenter.findOne({ owner_id: uid });

        if (!userProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Prepare response data
        const responseData = {
            userProfile: userProfile.toObject(),
            fitnessCenter: fitnessCenter ? fitnessCenter.toObject() : null
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching vendor profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
