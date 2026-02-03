import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { authenticated } from '../../../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    // @ts-ignore
    const requestingUser = req.user;
    if (requestingUser.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.query;

    try {
        const userToDelete = await User.findById(id);
        if (!userToDelete) return res.status(404).json({ message: 'User not found' });

        // Prevent deleting self?
        if (userToDelete._id.toString() === requestingUser.id) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export default authenticated(handler);
