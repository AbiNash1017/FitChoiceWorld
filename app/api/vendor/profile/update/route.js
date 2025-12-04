import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';

/**
 * POST - Create or update center admin profile
 * Expects: first_name, last_name, gender, admin_phone_number, admin_email, 
 *          fitness_center_id, profile_image_url (optional)
 */
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

        console.log('=== CENTER ADMIN PROFILE CREATE/UPDATE ===');
        console.log('UID:', uid);
        console.log('Request body:', body);

        await dbConnect();

        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'gender', 'admin_phone_number', 'admin_email', 'fitness_center_id'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json({
                error: 'Missing required fields',
                missingFields
            }, { status: 400 });
        }

        // Generate username from uid (e.g., "fca-n2s9SPaNn2")
        const username = `fca-${uid.slice(-10)}`;

        const adminData = {
            uid,
            fitness_center_id: body.fitness_center_id,
            username,
            first_name: body.first_name,
            last_name: body.last_name,
            gender: body.gender.toUpperCase(),
            admin_phone_number: body.admin_phone_number,
            admin_email: body.admin_email,
            profile_image_url: body.profile_image_url || null,
            is_profile_verified: body.is_profile_verified || false,
        };

        console.log('Admin data prepared:', adminData);

        const adminProfile = await CenterAdminMetadata.findOneAndUpdate(
            { uid },
            { $set: adminData },
            { new: true, upsert: true, runValidators: true }
        );

        console.log('=== PROFILE CREATED/UPDATED SUCCESSFULLY ===');
        return NextResponse.json({
            message: 'Center admin profile created/updated successfully',
            adminProfile
        });
    } catch (error) {
        console.error('Error creating/updating center admin profile:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}

/**
 * PATCH - Update specific fields of center admin profile
 * Expects: Any subset of updatable fields
 * Note: profile_image_url should be the Firebase Storage URL after upload
 */
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

        console.log('=== CENTER ADMIN PROFILE UPDATE ===');
        console.log('UID:', uid);
        console.log('Request body:', body);

        await dbConnect();

        // Check if admin profile exists
        const existingProfile = await CenterAdminMetadata.findOne({ uid });
        if (!existingProfile) {
            return NextResponse.json({
                error: 'Admin profile not found. Please create a profile first.'
            }, { status: 404 });
        }

        const updateData = {};

        // Only update fields that are provided
        if (body.first_name !== undefined) updateData.first_name = body.first_name;
        if (body.last_name !== undefined) updateData.last_name = body.last_name;
        if (body.gender !== undefined) updateData.gender = body.gender.toUpperCase();
        if (body.admin_phone_number !== undefined) updateData.admin_phone_number = body.admin_phone_number;
        if (body.admin_email !== undefined) updateData.admin_email = body.admin_email;
        if (body.profile_image_url !== undefined) updateData.profile_image_url = body.profile_image_url;
        if (body.is_profile_verified !== undefined) updateData.is_profile_verified = body.is_profile_verified;

        console.log('Update data prepared:', updateData);

        const adminProfile = await CenterAdminMetadata.findOneAndUpdate(
            { uid },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        console.log('=== PROFILE UPDATE SUCCESSFUL ===');
        return NextResponse.json({
            message: 'Center admin profile updated successfully',
            adminProfile
        });
    } catch (error) {
        console.error('Error updating center admin profile:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
