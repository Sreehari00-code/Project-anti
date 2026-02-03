import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Event from '../../../models/Event';
import EventJoin from '../../../models/EventJoin';
import { authenticated } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    // @ts-ignore
    const user = req.user;
    const { eventId } = req.body; // For POST and DELETE usually strict to body or query for DELETE. 
    // User code: POST /join-event, DELETE /forfeit-event both use body.

    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
    }

    if (req.method === 'POST') {
        // JOIN
        try {
            const event = await Event.findById(eventId);
            if (!event) return res.status(404).json({ message: 'Event not found' });

            if (event.currentParticipants >= event.maxParticipants) {
                return res.status(400).json({ message: 'Event is full' });
            }

            const existingJoin = await EventJoin.findOne({ user: user.id, event: eventId });
            if (existingJoin) return res.status(400).json({ message: 'Already joined this event' });

            const join = await EventJoin.create({ user: user.id, event: eventId });

            event.currentParticipants += 1;
            // Check for 'Ongoing' if date is now (user logic)
            // We rely on pre-save hook in model but let's trust that for now, 
            // or re-run computeStatus if we want immediate consistency.
            await event.save();

            res.status(200).json({ success: true, message: 'Joined event successfully', join });
        } catch (error: any) {
            if (error.code === 11000) return res.status(400).json({ message: 'Already joined' });
            res.status(500).json({ message: error.message });
        }

    } else if (req.method === 'DELETE') {
        // FORFEIT
        try {
            const existingJoin = await EventJoin.findOne({ user: user.id, event: eventId });
            if (!existingJoin) return res.status(404).json({ message: 'You have not joined this event' });

            await EventJoin.deleteOne({ _id: existingJoin._id });

            const event = await Event.findById(eventId);
            if (event && event.currentParticipants > 0) {
                event.currentParticipants -= 1;
                await event.save();
            }

            res.status(200).json({ success: true, message: 'Forfeited event successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }

    } else if (req.method === 'GET') {
        // Check status (Frontend needs this)
        // We can keep this for "Am I joined?" check
        // Or move to separate file if we want to follow user structure strictly, 
        // but standard REST pattern suggests GET /join?eventId returns status

        try {
            const join = await EventJoin.findOne({ user: user.id, event: eventId });
            res.status(200).json({ joined: !!join });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}

export default authenticated(handler);
