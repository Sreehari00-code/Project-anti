import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

export default function DonationManagement() {
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchDonations = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/donations?page=${pageNumber}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setDonations(data.donations || []);
                setPage(data.currentPage);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch donations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations(page);
    }, [page]);

    return (
        <div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date / Time</th>
                            <th>Donor</th>
                            <th>Event</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : donations.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>No donations found.</td></tr>
                        ) : donations.map(donation => (
                            <tr key={donation._id}>
                                <td>{new Date(donation.createdAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</td>
                                <td>
                                    {donation.user ? (
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{donation.user.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{donation.user.email}</div>
                                        </div>
                                    ) : (
                                        <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Guest</span>
                                    )}
                                </td>
                                <td>{donation.event?.name || 'Deleted Event'}</td>
                                <td style={{ fontWeight: 'bold', color: '#4ade80' }}>
                                    ${(donation.amount / 100).toFixed(2)}
                                </td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        background: donation.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                            donation.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: donation.status === 'completed' ? '#4ade80' :
                                            donation.status === 'pending' ? '#fbbf24' : '#fca5a5',
                                        fontSize: '0.8rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {donation.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                <button
                    className={styles.actionBtn}
                    disabled={page <= 1 || loading}
                    onClick={() => setPage(p => p - 1)}
                >
                    Previous
                </button>
                <div style={{ color: '#cbd5e1' }}>
                    Page {page} of {totalPages}
                </div>
                <button
                    className={styles.actionBtn}
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
