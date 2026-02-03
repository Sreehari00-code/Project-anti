import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { parse } from 'cookie';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') return res.status(405).end();

    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ message: 'User not found' });

    res.status(200).json({ user: { id: user._id, username: user.username, email: user.email, role: user.role, profilePicture: user.profilePicture } });
}
