// lib/models/CenterAdminMetadata.js
import mongoose from 'mongoose';

const CenterAdminMetadataSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    fitness_center_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FitnessCenter',
        required: true,
        index: true,
    },
    username: {
        type: String,
        required: true,
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER'],
        required: true,
    },
    admin_phone_number: {
        type: String,
        required: true,
    },
    admin_email: {
        type: String,
        required: true,
    },
    profile_image_url: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: '',
    },
    is_profile_verified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    autoIndex: process.env.NODE_ENV !== 'production',
});

// Index for faster queries by uid and fitness_center_id
CenterAdminMetadataSchema.index({ uid: 1, fitness_center_id: 1 });

export default mongoose.models.CenterAdminMetadata ||
    mongoose.model('CenterAdminMetadata', CenterAdminMetadataSchema, 'center_admin_metadata');
