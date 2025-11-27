import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await dbConnect();
        const { uid, phoneNumber } = await req.json();

        if (!uid || !phoneNumber) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        let user = await User.findOne({ uid });

        if (!user) {
            user = await User.create({
                uid,
                phone_number: phoneNumber,
            });
        } else {
            // Update existing user if needed
            if (user.phone_number !== phoneNumber) {
                user.phone_number = phoneNumber;
                await user.save();
            }
        }

        return NextResponse.json({ message: "OK", user }, { status: 200 });
    } catch (error) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
