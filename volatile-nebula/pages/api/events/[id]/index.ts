import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
import Category from '../../../../models/Category';
import { authenticated } from '../../../../lib/auth';
import { computeStatus } from '../../../../lib/eventUtils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const event = await Event.findById(id)
                    .populate('category', 'name')
                    .select('name code date location description category image user isDisabled status maxParticipants currentParticipants');

                if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

                res.status(200).json({ success: true, message: 'Event retrieved', event });
            } catch (error: any) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        case 'PUT':
            // @ts-ignore
            const user = req.user; // Auth wrapper ensures this

            try {
                const { name, date, location, description, category, maxParticipants, image } = req.body;

                const event = await Event.findById(id);
                if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

                // Add ownership check
                if (event.user.toString() !== user.id && user.role !== 'admin') {
                    return res.status(403).json({ success: false, message: 'Not authorized' });
                }

                if (maxParticipants < event.currentParticipants) {
                    return res.status(400).json({ success: false, message: `Max participants cannot be less than current participants (${event.currentParticipants})` });
                }

                if (category) {
                    const validCategory = await Category.findById(category);
                    if (!validCategory) return res.status(400).json({ success: false, message: 'Invalid category' });
                    event.category = category;
                }

                if (name) event.name = name;
                if (date) event.date = date;
                if (location) event.location = location;
                if (description) event.description = description;
                if (maxParticipants) event.maxParticipants = maxParticipants;
                if (image) event.image = image;

                event.status = computeStatus(event);
                await event.save();

                res.status(200).json({ success: true, message: 'Event updated successfully', event });

            } catch (error: any) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
            break;
    }
}

export default async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        return authenticated(handler)(req, res);
    }
    return handler(req, res);
}
