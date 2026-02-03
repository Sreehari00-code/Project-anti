import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Event from '../../../models/Event';
import { authenticated } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    // @ts-ignore
    const user = req.user;

    if (user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        try {
            const events = await Event.find({})
                .populate('category', 'name')
                .populate('user', 'username')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, events });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}

export default authenticated(handler);
