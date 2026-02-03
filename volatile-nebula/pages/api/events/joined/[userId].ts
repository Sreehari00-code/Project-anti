import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import EventJoin from '../../../../models/EventJoin';
import Event from '../../../../models/Event'; // Ensure Event model is registered
import Category from '../../../../models/Category'; // Ensure Category model is registered

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.query;

    await dbConnect();

    // Ensure models are compiled
    // Mongoose models are compiled when imported.

    try {
        const joinedEvents = await EventJoin.find({ user: userId })
            .populate({
                path: 'event',
                populate: { path: 'category', select: 'name' }
            })
            .populate('user', 'username email role');

        res.status(200).json({ success: true, message: 'Joined events fetched successfully', joinedEvents });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
