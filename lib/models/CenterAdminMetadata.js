import mongoose from 'mongoose';

const CenterAdminMetadataSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        index: true,
    },
    fitness_center_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FitnessCenter',
        required: false, // Making false initially as user might not have a center yet? User said "fitness_center_id 6918a654..." in example.
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
        type: String,
    },
    admin_phone_number: {
        type: String,
    },
    admin_email: {
        type: String,
    },
    profile_image_url: {
        type: String,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    is_profile_verified: {
        type: Boolean,
        default: false,
    },
}, {
    collection: 'center_admin_metadata',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: false
});

export default mongoose.models.CenterAdminMetadata || mongoose.model('CenterAdminMetadata', CenterAdminMetadataSchema);
