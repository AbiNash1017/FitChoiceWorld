import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { customInitApp } from '@/lib/firebase-admin-config';

customInitApp();

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await auth().verifyIdToken(token);

        const body = await request.json();
        const { status } = body;

        // Mock success
        return NextResponse.json({ message: "OK" }, { status: 200 });

    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
