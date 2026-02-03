import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { authenticated } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    // @ts-ignore
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users); // Return array directly to match common patterns or { users }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export default authenticated(handler);
