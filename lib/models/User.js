// lib/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    username: {
        type: String,
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    gender: {
        type: Number,
        default: 0,
    },
    phone_number: {
        type: String,
    },
    user_since: {
        type: Date,
        default: Date.now,
    },
    karma_points: {
        type: Number,
        default: 0,
    },
    ai_credits: {
        type: Number,
        default: 0,
    },
    bio: {
        type: String,
    },
    about: {
        type: String,
    },
    profile_image_url: {
        type: String,
    },
    bmi: {
        type: Number,
    },
}, {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'production',
});

export default mongoose.models.User || mongoose.model('User', UserSchema, 'user_metadata');