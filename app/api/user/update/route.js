import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';
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

        const updateData = {
            first_name: body.first_name,
            last_name: body.last_name,
            gender: body.gender,
            phone_number: body.phone_number,

        };

        if (!updateData.username) {
            // Ensure username exists if not present (though sync route should handle it)
            // We can check if existing user has username, if not we might want to set it.
            // But simpler to let the data flow.
        }

        const user = await User.findOneAndUpdate(
            { uid },
            {
                $set: updateData,
                $setOnInsert: { username: `fcw-${uid.slice(-10)}` }
            },
            { new: true, upsert: true }
        );

        // Sync to CenterAdminMetadata
        try {
            const fitnessCenter = await FitnessCenter.findOne({ owner_id: uid });
            if (fitnessCenter) {
                const adminUpdateData = {
                    uid,
                    fitness_center_id: fitnessCenter._id,
                    username: user.username || `fcw-${uid.slice(-10)}`,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    gender: (function (g) {
                        if (g === undefined || g === null) return null;
                        const s = String(g).toLowerCase();
                        if (s === 'male' || s === '0') return 'MALE';
                        if (s === 'female' || s === '1') return 'FEMALE';
                        return s.toUpperCase();
                    })(user.gender),
                    admin_phone_number: user.phone_number,
                    admin_email: user.email,
                    profile_image_url: user.profile_image_url,
                    updated_at: new Date(),
                };

                await CenterAdminMetadata.findOneAndUpdate(
                    { uid },
                    { $set: adminUpdateData },
                    { upsert: true }
                );
            }
        } catch (syncError) {
            console.error('Error syncing to CenterAdminMetadata:', syncError);
            // Non-blocking error
        }

        return NextResponse.json({ message: 'OK', user });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const body = await request.json();

        console.log('=== USER UPDATE DEBUG ===');
        console.log('UID:', uid);
        console.log('Request body:', body);

        await dbConnect();

        const updateData = {};

        // Only update fields that are provided
        if (body.email !== undefined) updateData.email = body.email;
        if (body.first_name !== undefined) updateData.first_name = body.first_name;
        if (body.last_name !== undefined) updateData.last_name = body.last_name;
        if (body.phone_number !== undefined) updateData.phone_number = body.phone_number;
        if (body.bio !== undefined) updateData.bio = body.bio;

        console.log('Update data prepared:', updateData);

        // First, find the user to see what exists
        const existingUser = await User.findOne({ uid });
        console.log('Existing user before update:', existingUser ? {
            uid: existingUser.uid,
            email: existingUser.email,
            first_name: existingUser.first_name
        } : 'NOT FOUND');

        const user = await User.findOneAndUpdate(
            { uid },
            { $set: updateData },
            { new: true, runValidators: true, strict: false }
        );

        if (!user) {
            // ... handling not found
            console.log('ERROR: User not found after update');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Ensure username if missing
        if (!user.username) {
            user.username = `fcw-${uid.slice(-10)}`;
            await user.save();
        }

        console.log('User after update:', user ? {
            uid: user.uid,
            email: user.email,
            first_name: user.first_name
        } : 'NOT FOUND');


        // Sync to CenterAdminMetadata
        try {
            const fitnessCenter = await FitnessCenter.findOne({ owner_id: uid });
            if (fitnessCenter) {
                const adminUpdateData = {
                    uid,
                    fitness_center_id: fitnessCenter._id,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    gender: (function (g) {
                        if (g === undefined || g === null) return null;
                        const s = String(g).toLowerCase();
                        if (s === 'male' || s === '0') return 'MALE';
                        if (s === 'female' || s === '1') return 'FEMALE';
                        return s.toUpperCase();
                    })(user.gender),
                    admin_phone_number: user.phone_number,
                    admin_email: user.email,
                    profile_image_url: user.profile_image_url,
                    updated_at: new Date(),
                };

                await CenterAdminMetadata.findOneAndUpdate(
                    { uid },
                    { $set: adminUpdateData },
                    { upsert: true }
                );
            }
        } catch (syncError) {
            console.error('Error syncing to CenterAdminMetadata:', syncError);
        }

        console.log('=== UPDATE SUCCESSFUL ===');
        return NextResponse.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
