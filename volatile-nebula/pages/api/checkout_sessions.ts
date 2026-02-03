import type { NextApiRequest, NextApiResponse } from 'next';
import stripe from '../../lib/stripe';
import { authenticated } from '../../lib/auth';
import dbConnect from '../../lib/mongodb';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    await dbConnect();
    // @ts-ignore
    const user = req.user; // injected by authenticated

    const { eventId, title, amount } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user?.email, // Personalize for logged in user
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Donation to: ${title}`,
                        },
                        unit_amount: amount * 100, // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/events/${eventId}?success=true`,
            cancel_url: `${req.headers.origin}/events/${eventId}?canceled=true`,
            metadata: {
                eventId,
                userId: user?.id || null,
            },
        });

        // Record pending donation
        const Donation = (await import('../../models/Donation')).default;
        await Donation.create({
            user: user?.id || null,
            event: eventId,
            amount: amount * 100,
            status: 'pending',
            stripeSessionId: session.id,
        });

        res.status(200).json({ id: session.id, url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ statusCode: 500, message: (err as Error).message });
    }
}

export default async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
    // We optionally authenticate, but if we want to track donator, wrap in authenticated
    return authenticated(handler)(req, res);
}
