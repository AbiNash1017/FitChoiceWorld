// lib/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true, // Explicitly define the index we want
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    gender: {
        type: String,
    },
    dob: {
        type: Date,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    mobile_no: {
        type: String,
    },
    latitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    address: {
        type: String,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    // Prevent Mongoose from automatically creating indexes
    autoIndex: process.env.NODE_ENV !== 'production',
});



export default mongoose.models.User || mongoose.model('Userrrr', UserSchema);