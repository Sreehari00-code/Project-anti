import type { NextApiRequest, NextApiResponse } from 'next';
import { seedCategories } from '../../lib/seed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await seedCategories();
        res.status(200).json({ message: 'Seeding complete' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}
