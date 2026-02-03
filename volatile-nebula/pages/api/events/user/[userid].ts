import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
import Category from '../../../../models/Category';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userid } = req.query;

    await dbConnect();

    try {
        const events = await Event.find({ user: userid })
            .populate('category', 'name')
            .select('name code date location description category image isDisabled status maxParticipants currentParticipants')
            .sort({ date: 1 });

        res.status(200).json({ success: true, message: 'Events retrieved', events });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
