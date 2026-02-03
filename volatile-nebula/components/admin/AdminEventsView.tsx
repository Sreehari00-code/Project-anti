import { useState, useEffect } from 'react';

export default function AdminEventsView() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/events');
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (err) {
            console.error('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const toggleEventStatus = async (eventId: string, currentIsDisabled: boolean, disabledBy: string) => {
        const nextStatus = !currentIsDisabled;

        try {
            const res = await fetch(`/api/events/${eventId}/disable`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disable: nextStatus })
            });
            const data = await res.json();

            if (res.ok) {
                fetchEvents();
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (err) {
            alert('Error toggling event status');
        }
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ color: '#6366f1' }}>Loading events...</div>;

    return (
        <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Platform Events</h2>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        width: '250px'
                    }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: '#94a3b8', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1rem' }}>Event</th>
                            <th style={{ padding: '1rem' }}>Code</th>
                            <th style={{ padding: '1rem' }}>Creator</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.map(event => (
                            <tr key={event._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, color: 'white' }}>{event.name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{event.category?.name}</div>
                                </td>
                                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{event.code}</td>
                                <td style={{ padding: '1rem' }}>{event.user?.username || 'Unknown'}</td>
                                <td style={{ padding: '1rem' }}>
                                    {event.isDisabled ? (
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#f87171',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.8rem'
                                        }}>
                                            Disabled by {event.disabledBy || 'System'}
                                        </span>
                                    ) : (
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            color: '#4ade80',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.8rem'
                                        }}>
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        onClick={() => toggleEventStatus(event._id, event.isDisabled, event.disabledBy)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            background: event.isDisabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: event.isDisabled ? '#4ade80' : '#f87171',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {event.isDisabled ? 'Enable' : 'Disable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
