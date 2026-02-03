import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for faster queries on conversations
MessageSchema.index({ sender: 1, recipient: 1, event: 1 });
MessageSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
