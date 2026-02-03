import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    const { username, email, password, profilePicture } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            profilePicture,
            role: 'user', // Default role
        });

        res.status(201).json({ success: true, message: 'User created' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}
