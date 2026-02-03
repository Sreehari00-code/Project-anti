import { useState, useEffect } from 'react';
import styles from '@/styles/Dashboard.module.css';

export default function MyDonationsView() {
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyDonations = async () => {
        try {
            const res = await fetch('/api/donations/my');
            if (res.ok) {
                const data = await res.json();
                setDonations(data.donations || []);
            }
        } catch (error) {
            console.error('Failed to fetch donations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyDonations();
    }, []);

    if (loading) return <div style={{ color: '#94a3b8' }}>Loading contributions...</div>;

    return (
        <div style={{ maxWidth: '800px' }}>
            {donations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8' }}>You haven't made any contributions yet.</p>
                </div>
            ) : (
                <div>
                    {donations.map(donation => (
                        <div key={donation._id} className={styles.timelineItem}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '1rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem'
                            }}>
                                🎁
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                                    {donation.event?.name || 'Supporting a cause'}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    {new Date(donation.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className={styles.amount}>
                                    +${(donation.amount / 100).toFixed(2)}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: donation.status === 'completed' ? '#4ade80' :
                                        donation.status === 'pending' ? '#fbbf24' : '#f87171'
                                }}>
                                    {donation.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
