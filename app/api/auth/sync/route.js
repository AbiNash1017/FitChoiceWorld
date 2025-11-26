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
                mobile_no: phoneNumber,
            });
        } else {
            // Update existing user if needed, e.g. update mobile number if it changed (unlikely for same UID but possible)
            // For now just ensuring it exists
            if (user.mobile_no !== phoneNumber) {
                user.mobile_no = phoneNumber;
                await user.save();
            }
        }

        return NextResponse.json({ message: "OK", user }, { status: 200 });
    } catch (error) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
