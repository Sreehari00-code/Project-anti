import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await dbConnect();

        const email = 'adminpnly@gmail.com';
        const password = 'AdminOnly';
        const username = 'AdminOnly';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(200).json({ message: 'Admin already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'admin',
        });

        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}
