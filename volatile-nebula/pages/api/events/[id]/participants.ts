import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
import EventJoin from '../../../../models/EventJoin';
import { authenticated } from '../../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    await dbConnect();
    // @ts-ignore
    const user = req.user;

    try {
        // 1. Verify that the current user is the creator of the event
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.user.toString() !== user.id && user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only the creator can view participants.' });
        }

        // 2. Fetch participants
        const joins = await EventJoin.find({ event: id })
            .populate('user', 'username email profilePicture')
            .sort({ joinedAt: 1 });

        const participants = joins.map(j => j.user);

        res.status(200).json({ success: true, participants });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export default authenticated(handler);
