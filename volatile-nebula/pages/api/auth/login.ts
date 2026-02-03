import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is disabled. Contact admin.' });
        }

        const token = generateToken(user._id, user.role);

        // Set cookie
        res.setHeader('Set-Cookie', serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        }));

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}
