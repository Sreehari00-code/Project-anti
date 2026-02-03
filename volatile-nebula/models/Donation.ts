import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
    user?: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    stripeSessionId: string;
    createdAt: Date;
    updatedAt: Date;
}

const DonationSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow guest donations if needed, but we target logged in users
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    stripeSessionId: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
