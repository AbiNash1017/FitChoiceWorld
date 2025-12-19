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
        unique: true,
        sparse: true
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    gender: {
        type: String,
        default: 'male',
    },
    phone_number: {
        type: String,
    },
    user_since: {
        type: Date,
        default: Date.now,
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
    // Other existing fields
    email: {
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
    address: {
        type: String,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    onboarding_completed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'production',
    strict: false
});

// Method to check if onboarding is complete
UserSchema.methods.isOnboardingComplete = function () {
    return !!(
        this.first_name &&
        this.last_name &&
        this.gender &&
        this.dob &&
        this.phone_number &&
        this.city &&
        this.state
    );
};

export default mongoose.models.User || mongoose.model('User', UserSchema, 'center_admin_metadata');