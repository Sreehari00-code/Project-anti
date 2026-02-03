import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    profilePicture: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
