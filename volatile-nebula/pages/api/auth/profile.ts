import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Event from '../../../models/Event';
import EventJoin from '../../../models/EventJoin';
import Donation from '../../../models/Donation';
import { authenticated } from '../../../lib/auth';
import { serialize } from 'cookie';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();
    // @ts-ignore
    const user = req.user;

    if (req.method === 'PUT') {
        try {
            const { username, profilePicture } = req.body;

            const updatedUser = await User.findByIdAndUpdate(
                user.id,
                { username, profilePicture },
                { new: true, runValidators: true }
            ).select('-password');

            res.status(200).json({ success: true, user: updatedUser });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Delete user data
            await User.findByIdAndDelete(user.id);
            // Optionally delete events created by user (or disable them)
            // But let's be thorough for "Account Deletion"
            await Event.deleteMany({ user: user.id });
            await EventJoin.deleteMany({ user: user.id });
            // We keep donations for records but anonymize them if needed? 
            // Usually donations are permanent records. We'll leave them.

            // Clear cookie
            res.setHeader('Set-Cookie', serialize('auth_token', '', {
                httpOnly: true,
                expires: new Date(0),
                path: '/',
            }));

            res.status(200).json({ success: true, message: 'Account deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}

export default authenticated(handler);
