import dbConnect from '../lib/mongodb';
import Category from '../models/Category';

const categories = [
    { name: 'Environment', description: 'Eco-friendly and sustainability events' },
    { name: 'Education', description: 'Workshops, seminars, and tutoring' },
    { name: 'Health', description: 'Medical camps and awareness drives' },
    { name: 'Social Welfare', description: 'Community support and aid' },
    { name: 'Animal Rights', description: 'Shelter support and adoption drives' },
];

export async function seedCategories() {
    await dbConnect();

    for (const cat of categories) {
        const exists = await Category.findOne({ name: cat.name });
        if (!exists) {
            await Category.create(cat);
            console.log(`Created category: ${cat.name}`);
        }
    }
}

// We can run this by importing it in a one-off API route or just run it on server start if we wanted.
// For now, I'll make a quick API route to trigger it.
