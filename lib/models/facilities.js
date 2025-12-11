import mongoose from 'mongoose';

const TimeSlotSchema = new mongoose.Schema({
    start_time: String,
    end_time: String,
    capacity: Number,
    price: Number,
    duration_minutes: Number,
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    instructor_name: String,
}, { _id: false });

const DayScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: [
            'DAY_OF_WEEK_MONDAY',
            'DAY_OF_WEEK_TUESDAY',
            'DAY_OF_WEEK_WEDNESDAY',
            'DAY_OF_WEEK_THURSDAY',
            'DAY_OF_WEEK_FRIDAY',
            'DAY_OF_WEEK_SATURDAY',
            'DAY_OF_WEEK_SUNDAY',
        ],
        required: true,
    },
    is_available: {
        type: Boolean,
        default: true,
    },
    time_slots: [TimeSlotSchema],
}, { _id: false });

const SpecialDateSchema = new mongoose.Schema({
    date: Date,
    is_available: {
        type: Boolean,
        default: true,
    },
    time_slots: [TimeSlotSchema],
}, { _id: false });

const FacilitySchema = new mongoose.Schema({
    fitness_center_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FitnessCenter',
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image_urls: {
        type: [String],
    },
    capacity: {
        type: Number,
    },
    price_per_slot: {
        type: Number,
    },
    duration_minutes: {
        type: Number,
    },
    equipment: {
        type: [String],
    },
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    instructor_name: {
        type: String,
    },
    instructor_profile_image: {
        type: String,
    },
    requires_booking: {
        type: Boolean,
        default: true,
    },
    schedule: {
        schedules: [DayScheduleSchema],
        special_dates: [SpecialDateSchema],
    },
    max_advance_booking_days: {
        type: Number,
    },
    min_advance_booking_hours: {
        type: Number,
    },
    min_no_of_slots: {
        type: Number,
    },
    icon_image_url: {
        type: String,
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    is_active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    autoIndex: process.env.NODE_ENV !== 'production',
});

export default mongoose.models.Facility || mongoose.model('Facility', FacilitySchema, 'facilities');
