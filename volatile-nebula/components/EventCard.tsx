import Link from 'next/link';
import styles from '@/styles/Event.module.css';

interface EventCardProps {
    event: any;
}

export default function EventCard({ event }: EventCardProps) {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <Link href={`/events/${event._id}`}>
            <div className={`${styles.card} glass`}>
                <div className={styles.imageContainer}>
                    <img
                        src={event.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80'}
                        alt={event.name}
                        className={styles.image}
                    />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: 'white' }}>
                        {event.status}
                    </div>
                </div>
                <div className={styles.content}>
                    <span className={styles.date}>{formattedDate}</span>
                    <span className={styles.ngo}>{event.category?.name || 'General'}</span>
                    <h3 className={styles.title}>{event.name}</h3>

                    <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        Open Slots: {Math.max(0, event.maxParticipants - (event.currentParticipants || 0))}
                    </div>

                    <p className={styles.description}>{event.description}</p>

                    <div className={styles.footer}>
                        {/* Removed Donation Target as per new schema, maybe show code or nothing */}
                        <span className={styles.detailsBtn}>View Details &rarr;</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
