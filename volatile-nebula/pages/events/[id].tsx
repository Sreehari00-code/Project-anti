import Head from 'next/head';
import { useRouter } from 'next/router';
import dbConnect from '../../lib/mongodb';
import Event from '../../models/Event';
import styles from '@/styles/Event.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CommentSection from '@/components/CommentSection';
import DirectMessageModal from '@/components/DirectMessageModal';

export default function EventDetail({ event }: { event: any }) {
    const router = useRouter();
    const { user } = useAuth();
    const [showDM, setShowDM] = useState(false);

    // Join State
    const [joining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [participants, setParticipants] = useState(event.currentParticipants);
    const [mounted, setMounted] = useState(false);

    // Donation State
    const [donationAmount, setDonationAmount] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (user) {
            fetch(`/api/events/join?eventId=${event._id}`)
                .then(res => res.status === 401 ? { joined: false } : res.json())
                .then(data => { if (data.joined) setHasJoined(true); })
                .catch(console.error);
        }
    }, [user, event._id]);

    if (router.isFallback) return <div className={styles.loading}>Loading event details...</div>;

    const handleJoin = async () => {
        if (!user) { router.push('/login'); return; }
        setJoining(true);
        try {
            const res = await fetch('/api/events/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event._id })
            });
            if (res.ok) {
                setHasJoined(true);
                setParticipants((p: number) => p + 1);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to join');
            }
        } catch (err) {
            alert('Failed to join');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Leave this event?')) return;
        setJoining(true);
        try {
            const res = await fetch('/api/events/join', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event._id })
            });
            if (res.ok) {
                setHasJoined(false);
                setParticipants((p: number) => p - 1);
            }
        } catch (err) {
            alert('Failed to leave');
        } finally {
            setJoining(false);
        }
    };

    const isCreator = !!(user && user.id === event.user);
    const progress = Math.min((participants / event.maxParticipants) * 100, 100);
    const isFull = participants >= event.maxParticipants;
    const isUnavailable = event.status === 'Completed' || event.status === 'Not Available' || (event.isDisabled === true);

    const handleDonate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event._id, title: event.name, amount: donationAmount }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            alert('Payment error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>{event.name} | GuardianLines</title>
            </Head>

            <div className={styles.professionalContainer}>
                {/* Hero Section */}
                <div className={styles.heroSection}>
                    <img
                        src={event.image || '/placeholder-event.jpg'}
                        alt={event.name}
                        className={styles.heroImage}
                    />
                    <div className={styles.heroOverlay}>
                        <div className={styles.heroContent}>
                            <span className={styles.badge}>{event.category?.name || 'Initiative'}</span>
                            <h1 className={styles.mainTitle}>{event.name}</h1>
                            <div className={styles.metaRow}>
                                <span>📅 {mounted ? new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : '...'}</span>
                                <span>📍 {event.location}</span>
                                <span>🔑 {event.code}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    {/* Main Info */}
                    <div className={styles.mainPanel}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Overview</h2>
                            <p className={styles.largeDescription}>{event.description}</p>
                        </section>

                        <CommentSection eventId={event._id} />
                    </div>

                    {/* Sticky Sidebar */}
                    <aside className={styles.stickySidebar}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Participation</span>
                                    <span style={{ fontWeight: '600' }}>{participants} / {event.maxParticipants}</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {!hasJoined ? (
                                    <button
                                        onClick={handleJoin}
                                        disabled={joining || isFull || isUnavailable || isCreator}
                                        className="cta"
                                        style={{ width: '100%', border: 'none', background: (isFull || isUnavailable || isCreator) ? '#334155' : 'var(--accent)' }}
                                    >
                                        {joining ? 'Processing...' : isFull ? 'Event Full' : isUnavailable ? 'Event Closed' : 'Join this Movement'}
                                    </button>
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '0.75rem', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '0.75rem' }}>
                                            ✓ Confirmed Participant
                                        </div>
                                        <button onClick={handleLeave} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
                                            Unable to attend? Leave event
                                        </button>
                                    </div>
                                )}

                                {isCreator ? (
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', borderRadius: '0.75rem' }}>
                                        👑 You are the Organizer
                                    </div>
                                ) : (
                                    user && (
                                        <button
                                            onClick={() => setShowDM(true)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                                        >
                                            💬 Contact Organizer
                                        </button>
                                    )
                                )}
                            </div>

                            <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Fuel the Impact</h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>$</span>
                                        <input
                                            type="number"
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white' }}
                                        />
                                    </div>
                                    <button onClick={handleDonate} disabled={loading} className="cta" style={{ border: 'none', padding: '0 1.25rem' }}>
                                        {loading ? '...' : 'Donate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {user && event.user && (
                <DirectMessageModal
                    isOpen={showDM}
                    onClose={() => setShowDM(false)}
                    recipientId={event.user}
                    recipientName="Organizer"
                    eventId={event._id}
                />
            )}
        </>
    );
}

export async function getServerSideProps({ params }: any) {
    await dbConnect();
    const doc = await Event.findById(params.id).populate('category');
    if (!doc) return { notFound: true };
    return { props: { event: JSON.parse(JSON.stringify(doc)) } };
}
