import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Message from '../../../models/Message';
import { authenticated } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id: otherUserId } = req.query; // The user we are chatting with
    const { event: eventId } = req.query; // Context event (optional but recommended)
    // @ts-ignore
    const user = req.user;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const query: any = {
                    $or: [
                        { sender: user.id, recipient: otherUserId },
                        { sender: otherUserId, recipient: user.id }
                    ]
                };
                if (eventId) query.event = eventId;

                const messages = await Message.find(query)
                    .sort({ createdAt: 1 })
                    .populate('sender', 'username profilePicture')
                    .populate('recipient', 'username profilePicture');

                // Mark received messages in this conversation as read
                await Message.updateMany(
                    { sender: otherUserId, recipient: user.id, isRead: false },
                    { $set: { isRead: true } }
                );

                res.status(200).json({ success: true, messages });
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
