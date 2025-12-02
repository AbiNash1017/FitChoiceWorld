import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
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
        const body = await request.json();

        await dbConnect();

        const updateData = {
            first_name: body.first_name,
            last_name: body.last_name,
            gender: body.gender,
            phone_number: body.phone_number,

        };

        const user = await User.findOneAndUpdate(
            { uid },
            { $set: updateData },
            { new: true, upsert: true }
        );

        return NextResponse.json({ message: 'OK', user });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
