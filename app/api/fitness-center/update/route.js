import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import FitnessCenter from '@/lib/models/fitnessCenters';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';

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

        await dbConnect();

        // Find the fitness center by owner_id
        const fitnessCenter = await FitnessCenter.findOne({ owner_id: uid });

        if (!fitnessCenter) {
            return NextResponse.json({ error: 'Fitness center not found' }, { status: 404 });
        }

        // Update fields
        if (body.centre_name) fitnessCenter.name = body.centre_name;
        if (body.centre_description) fitnessCenter.description = body.centre_description;
        if (body.contact_no) fitnessCenter.phone_number = body.contact_no;

        // Update location fields
        if (body.address) {
            fitnessCenter.location.address = body.address;
        }
        if (body.pincode) {
            fitnessCenter.location.postal_code = body.pincode;
        }

        // Update images with proper array handling
        if (body.header_image !== undefined) {
            // If header_image is provided, set it as the first image
            if (body.header_image) {
                if (fitnessCenter.image_urls && fitnessCenter.image_urls.length > 0) {
                    fitnessCenter.image_urls[0] = body.header_image;
                } else {
                    fitnessCenter.image_urls = [body.header_image];
                }
            }
        }

        if (body.centre_images && Array.isArray(body.centre_images)) {
            // Replace all images with the new list
            fitnessCenter.image_urls = body.centre_images;
        }

        // Update amenities
        if (body.amenities && Array.isArray(body.amenities)) {
            fitnessCenter.amenities = body.amenities;
        }

        await fitnessCenter.save();

        // Also update center_admin_metadata if needed
        await CenterAdminMetadata.findOneAndUpdate(
            { uid: uid },
            {
                fitness_center_id: fitnessCenter._id,
                updated_at: new Date()
            },
            { upsert: false }
        );

        return NextResponse.json({
            message: 'Fitness center updated successfully',
            fitnessCenter: fitnessCenter
        });
    } catch (error) {
        console.error('Error updating fitness center:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
