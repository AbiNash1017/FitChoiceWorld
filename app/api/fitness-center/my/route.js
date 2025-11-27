import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
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
        const fitnessCenter = await FitnessCenter.findOne({ owner_id: uid });

        if (!fitnessCenter) {
            return NextResponse.json({ error: 'Fitness Center not found' }, { status: 404 });
        }

        return NextResponse.json(fitnessCenter);
    } catch (error) {
        console.error('Error fetching fitness center:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
