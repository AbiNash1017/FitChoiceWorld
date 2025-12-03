// app/api/auth/onboardOwner/route.js

import { adminAuth } from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request) {
    try {
        const body = await request.json()
        const { first_name, last_name, gender, dob, state, city, mobile_no, latitude, longitude, address } = body

        // Validate required fields
        if (!first_name || !last_name) {
            return NextResponse.json({
                error: 'Missing required fields: first_name and last_name are required'
            }, { status: 400 })
        }

        // Get the authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]
        let uid;

        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            uid = decodedToken.uid;
        } catch (error) {
            console.error('Auth error:', error)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Connect to MongoDB
        await dbConnect()

        // Upsert user (create if not exists, update if exists)
        const updatedUser = await User.findOneAndUpdate(
            { uid: uid },
            {
                first_name,
                last_name,
                gender,
                dob,
                state,
                city,
                phone_number: mobile_no,
                latitude,
                longitude,
                address,
                onboarding_completed: true,
                updated_at: new Date(),
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )

        return NextResponse.json({
            message: 'User onboarded successfully',
            user: updatedUser,
            nextStep: '/createCentre'
        }, { status: 200 })

    } catch (error) {
        console.error('Onboard owner error:', error)

        // Handle duplicate key error specifically
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return NextResponse.json({
                error: `Duplicate value for field: ${field}`,
                details: error.keyValue
            }, { status: 409 })
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 })
        }

        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 })
    }
}