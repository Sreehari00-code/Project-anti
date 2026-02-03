import mongoose, { Schema, Document } from 'mongoose';

const EventJoinSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

// Prevent the same user from joining the same event twice
EventJoinSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.models.EventJoin || mongoose.model('EventJoin', EventJoinSchema);
