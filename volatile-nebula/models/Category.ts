import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description?: string;
}

const CategorySchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
