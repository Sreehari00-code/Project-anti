import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    user: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    text: string;
    parentId?: mongoose.Types.ObjectId; // For replies
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
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
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
