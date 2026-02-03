import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../models/Category';

// Public Handler for Getting Active Categories
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const categories = await Category.find({ isActive: true }).sort({ name: 1 }).select('name');
                res.status(200).json({ success: true, categories }); // Changed structure to match user req { categories }
            } catch (error) {
                res.status(400).json({ success: false });
            }
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
            break;
    }
}
