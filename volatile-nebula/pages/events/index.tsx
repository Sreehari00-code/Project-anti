import Head from 'next/head';
import dbConnect from '../../lib/mongodb';
import Event from '../../models/Event';
import EventCard from '../../components/EventCard';
import styles from '@/styles/Event.module.css';
import Link from 'next/link';

export default function Events({ events }: { events: any[] }) {
    return (
        <>
            <Head>
                <title>GuardianLines | Events</title>
            </Head>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Upcoming Impact <span className="gradient-text">Events</span></h1>
                    <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
                        Join hand-picked events from verified NGOs. Whether you want to volunteer, donate, or learn, your journey starts here.
                    </p>
                    <div style={{ marginTop: '2rem' }}>
                        <Link href="/events/create" style={{ fontSize: '0.9rem', color: 'var(--accent)', textDecoration: 'underline' }}>
                            Are you an NGO? List your event
                        </Link>
                    </div>
                </div>

                {events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                        <h3>No events found yet.</h3>
                        <p>Be the first to create one!</p>
                        <Link href="/events/create" className="cta" style={{ display: 'inline-block', marginTop: '1rem' }}>
                            Create Event
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {events.map((event) => (
                            <EventCard key={event._id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export async function getServerSideProps() {
    await dbConnect();

    // Find all events and serialize to JSON
    // Populate category for display
    // Only show events that are not disabled
    const result = await Event.find({ isDisabled: { $ne: true } })
        .populate('category')
        .populate('user', 'username')
        .sort({ date: 1 });

    // Use JSON parse/stringify for safer serialization of ObjectIds/Dates
    const events = JSON.parse(JSON.stringify(result));

    return {
        props: { events },
    };
}
