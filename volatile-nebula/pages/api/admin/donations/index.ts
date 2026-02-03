import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Donation from '../../../../models/Donation';
import { adminOnly } from '../../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const total = await Donation.countDocuments();
        const donations = await Donation.find({})
            .populate('user', 'username email')
            .populate('event', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            donations,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalDonations: total
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export default adminOnly(handler);
