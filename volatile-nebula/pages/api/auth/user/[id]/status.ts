import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { authenticated } from '../../../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    // @ts-ignore
    const requestingUser = req.user;
    if (requestingUser.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.query;
    const { isActive } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user._id.toString() === requestingUser.id) {
            return res.status(400).json({ message: 'Cannot change your own status' });
        }

        // Explicitly check for admin role protection if desired, but maybe allow disabling other admins?
        // Let's allow admins to manage other admins but usually super-admin logic applies. 
        // consistently allowing it for now.

        user.isActive = isActive;
        await user.save();

        res.status(200).json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export default authenticated(handler);
