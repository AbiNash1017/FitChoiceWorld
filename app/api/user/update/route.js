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
        if (body.profile_image_url !== undefined) updateData.profile_image_url = body.profile_image_url;

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

        console.log('User after update:', user ? {
            uid: user.uid,
            email: user.email,
            first_name: user.first_name
        } : 'NOT FOUND');

        if (!user) {
            console.log('ERROR: User not found after update');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // ALSO update center_admin_metadata if it exists
        const CenterAdminMetadata = (await import('@/lib/models/CenterAdminMetadata')).default;
        const adminUpdateData = {};

        if (body.email !== undefined) adminUpdateData.admin_email = body.email;
        if (body.first_name !== undefined) adminUpdateData.first_name = body.first_name;
        if (body.last_name !== undefined) adminUpdateData.last_name = body.last_name;
        if (body.phone_number !== undefined) adminUpdateData.admin_phone_number = body.phone_number;
        if (body.profile_image_url !== undefined) adminUpdateData.profile_image_url = body.profile_image_url;
        if (body.bio !== undefined) adminUpdateData.bio = body.bio;

        if (Object.keys(adminUpdateData).length > 0) {
            await CenterAdminMetadata.findOneAndUpdate(
                { uid },
                { $set: adminUpdateData },
                { new: true }
            );
            console.log('Also updated center_admin_metadata');
        }

        console.log('=== UPDATE SUCCESSFUL ===');
        return NextResponse.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

