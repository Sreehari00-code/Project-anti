import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Category from '../../../../models/Category';
import { authenticated } from '../../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    await dbConnect();

    // Admin Check
    // @ts-ignore
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    switch (method) {
        case 'GET':
            try {
                const categories = await Category.find().sort({ createdAt: -1 });
                res.status(200).json({ success: true, categories });
            } catch (error: any) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        case 'POST':
            try {
                const { name } = req.body;
                if (!name) return res.status(400).json({ message: 'Category name required' });

                const exists = await Category.findOne({ name });
                if (exists) return res.status(400).json({ message: 'Category already exists' });

                const category = await Category.create({ name });
                res.status(201).json({ success: true, category });
            } catch (error: any) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
            break;
    }
}

export default authenticated(handler);
