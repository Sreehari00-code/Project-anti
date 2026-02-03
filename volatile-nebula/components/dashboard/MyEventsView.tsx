import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';

export default function MyEventsView() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const fetchMyEvents = async () => {
        try {
            const res = await fetch('/api/events/my');
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const toggleEventStatus = async (eventId: string, currentIsDisabled: boolean) => {
        try {
            const res = await fetch(`/api/events/${eventId}/disable`, {
                method: 'PATCH', // Changed to PATCH to match API
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disable: !currentIsDisabled }) // Changed to 'disable' to match API
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(events.map(e => e._id === eventId ? { ...e, isDisabled: data.event.isDisabled, status: data.event.status } : e));
            } else {
                const err = await res.json();
                alert(err.message || 'Action failed');
            }
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const viewParticipants = async (eventId: string) => {
        setSelectedEventId(eventId);
        setLoadingParticipants(true);
        try {
            const res = await fetch(`/api/events/${eventId}/participants`);
            if (res.ok) {
                const data = await res.json();
                setParticipants(data.participants || []);
            }
        } catch (error) {
            console.error('Failed to fetch participants', error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    if (loading) return <div style={{ color: '#94a3b8' }}>Loading your events...</div>;

    return (
        <div>
            {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>You haven't created any events yet.</p>
                    <Link href="/events/create">
                        <button className="cta" style={{ border: 'none' }}>Create Your First Event</button>
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {events.map(event => (
                        <div key={event._id} className={styles.card}>
                            <div className={`${styles.statusBadge}`} style={{
                                background: event.isDisabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                color: event.isDisabled ? '#f87171' : '#4ade80',
                                border: `1px solid ${event.isDisabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                            }}>
                                {event.isDisabled ? 'Disabled' : event.status}
                            </div>

                            <h3 className={styles.cardTitle}>{event.name}</h3>

                            <div className={styles.cardMeta}>
                                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                <span>👥 {event.currentParticipants} / {event.maxParticipants}</span>
                                <span>🔖 {event.code}</span>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.iconBtn}
                                    onClick={() => viewParticipants(event._id)}
                                    title="View Participants"
                                >
                                    👥
                                </button>
                                <Link href={`/events/${event._id}/edit`}>
                                    <button className={styles.iconBtn} title="Edit Details">📝</button>
                                </Link>
                                {event.disabledBy === 'admin' ? (
                                    <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Admin Lock
                                    </div>
                                ) : (
                                    <button
                                        className={styles.iconBtn}
                                        onClick={() => toggleEventStatus(event._id, event.isDisabled)}
                                        title={event.isDisabled ? "Enable Event" : "Disable Event"}
                                        style={{ color: event.isDisabled ? '#4ade80' : '#f87171' }}
                                    >
                                        {event.isDisabled ? '👁️' : '🚫'}
                                    </button>
                                )}
                                <Link href={`/events/${event._id}`}>
                                    <button className={styles.iconBtn} title="View Page">🔗</button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Participants Modal */}
            {selectedEventId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '2rem', borderRadius: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0 }}>Event Participants</h3>
                            <button onClick={() => setSelectedEventId(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {loadingParticipants ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</div>
                        ) : participants.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No one has joined yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {participants.map(p => (
                                    <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <img src={p.profilePicture || 'https://via.placeholder.com/40'} alt={p.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{p.username}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{p.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
