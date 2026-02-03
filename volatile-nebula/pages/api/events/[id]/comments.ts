import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Comment from '../../../../models/Comment';
import { authenticated } from '../../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id: eventId } = req.query;

    await dbConnect();

    if (req.method === 'GET') {
        try {
            const comments = await Comment.find({ event: eventId })
                .populate('user', 'username profilePicture')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, comments });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else if (req.method === 'POST') {
        // @ts-ignore
        const user = req.user;

        try {
            const { text, parentId } = req.body;

            if (!text) {
                return res.status(400).json({ success: false, message: 'Comment text is required' });
            }

            const comment = await Comment.create({
                user: user.id,
                event: eventId,
                text,
                parentId: parentId || null
            });

            const populatedComment = await Comment.findById(comment._id).populate('user', 'username profilePicture');

            res.status(201).json({ success: true, comment: populatedComment });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}

export default async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        return authenticated(handler)(req, res);
    }
    return handler(req, res);
}
