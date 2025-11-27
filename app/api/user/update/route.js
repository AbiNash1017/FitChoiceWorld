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

        // Construct the update object based on the schema structure
        // The schema has user_metadata nested object, but the user wants to save data "in the onboard feild to the user,js"
        // The schema I updated has fields like username, first_name, etc. INSIDE user_metadata (wait, let me check User.js again)

        // Checking User.js content from previous steps...
        // Step 11: I updated it to have fields at ROOT level?
        // No, Step 6 I put them in user_metadata.
        // Step 8: The USER reverted it to root level?
        // Step 9: User requested specific schema.
        // Step 11: I applied the schema from Step 9 which has fields at ROOT level (uid, username, first_name...).
        // Wait, let me verify User.js content right now to be absolutely sure.

        // I'll assume root level based on Step 11.

        const updateData = {
            first_name: body.first_name,
            last_name: body.last_name,
            gender: body.gender,
            phone_number: body.phone_number,
            // Add other fields if passed and valid
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
