// app/api/auth/status/route.js
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import FitnessCenter from '@/lib/models/fitnessCenters';

export async function GET(request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                authenticated: false,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/login'
            }, { status: 200 });
        }

        const token = authHeader.split('Bearer ')[1];
        let uid;

        // Verify Firebase token
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            uid = decodedToken.uid;
        } catch (error) {
            console.error('Token verification error:', error);
            return NextResponse.json({
                authenticated: false,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/login'
            }, { status: 200 });
        }

        // Connect to MongoDB
        await dbConnect();

        // Find user in database
        const user = await User.findOne({ uid });

        if (!user) {
            // User exists in Firebase but not in MongoDB - needs to complete onboarding
            return NextResponse.json({
                authenticated: true,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/onboard'
            }, { status: 200 });
        }

        // Check if onboarding is complete
        const onboardingCompleted = user.isOnboardingComplete();

        if (!onboardingCompleted) {
            return NextResponse.json({
                authenticated: true,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/onboard'
            }, { status: 200 });
        }

        // Check if user has a fitness center
        const fitnessCenter = await FitnessCenter.findOne({ owner_id: uid });
        const hasFitnessCenter = !!fitnessCenter;

        return NextResponse.json({
            authenticated: true,
            onboardingCompleted: true,
            hasFitnessCenter,
            nextStep: hasFitnessCenter ? '/vendor/dashboard' : '/createCentre'
        }, { status: 200 });

    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json({
            authenticated: false,
            onboardingCompleted: false,
            hasFitnessCenter: false,
            nextStep: '/login',
            error: 'Internal Server Error'
        }, { status: 500 });
    }
}
