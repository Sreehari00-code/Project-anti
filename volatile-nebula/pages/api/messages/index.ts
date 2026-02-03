import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Message from '../../../models/Message';
import { authenticated } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    // @ts-ignore
    const user = req.user;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                // Fetch unique users that the current user has exchanged messages with
                const messages = await Message.find({
                    $or: [{ sender: user.id }, { recipient: user.id }]
                })
                    .sort({ createdAt: -1 })
                    .populate('sender', 'username profilePicture')
                    .populate('recipient', 'username profilePicture')
                    .populate('event', 'name');

                // Group by conversation (other user + event context)
                const conversations: any[] = [];
                const seen = new Set();

                messages.forEach(msg => {
                    const otherUser = msg.sender._id.toString() === user.id ? msg.recipient : msg.sender;
                    const key = `${otherUser._id}_${msg.event?._id}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        conversations.push({
                            otherUser,
                            event: msg.event,
                            lastMessage: msg.text,
                            lastDate: msg.createdAt,
                            unread: !msg.isRead && msg.recipient._id.toString() === user.id
                        });
                    }
                });

                res.status(200).json({ success: true, conversations });
            } catch (error: any) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        case 'POST':
            try {
                const { recipient, event, text } = req.body;
                if (!recipient || !event || !text) {
                    return res.status(400).json({ success: false, message: 'Missing required fields' });
                }

                const newMessage = new Message({
                    sender: user.id,
                    recipient,
                    event,
                    text
                });

                await newMessage.save();
                res.status(201).json({ success: true, message: newMessage });
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
