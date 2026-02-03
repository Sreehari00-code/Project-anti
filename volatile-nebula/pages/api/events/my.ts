import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Event from '../../../models/Event';
import { authenticated } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    await dbConnect();
    // @ts-ignore
    const user = req.user;

    try {
        const events = await Event.find({ user: user.id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, events });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export default authenticated(handler);
