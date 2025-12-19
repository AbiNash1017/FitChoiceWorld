import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';
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
        const user = await User.findOne({ uid });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check fitness center ownership via CenterAdminMetadata
        // This seems to be a mixed route (User + FitnessCenter).
        // Safest is to check CenterAdminMetadata for this UID.
        const metadata = await CenterAdminMetadata.findOne({ uid });
        const fitnessCenterId = metadata?.fitness_center_id;

        // Convert user to object and add additional fields
        const userObject = user.toObject();
        userObject.onboarding_completed = user.isOnboardingComplete();
        userObject.hasFitnessCenter = !!fitnessCenterId;

        return NextResponse.json(userObject);
    } catch (error) {
        console.error('Error verifying token or fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
