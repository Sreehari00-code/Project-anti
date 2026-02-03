import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
import Category from '../../../../models/Category';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code } = req.query;

    await dbConnect();

    try {
        const event = await Event.findOne({ code }).populate('category', 'name');

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.isDisabled) {
            return res.status(403).json({ success: false, message: 'Event is not available' });
        }

        res.status(200).json({ success: true, message: 'Event retrieved', event });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
