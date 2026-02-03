import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/Dashboard.module.css';

interface DirectMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    recipientName: string;
    eventId: string;
}

export default function DirectMessageModal({ isOpen, onClose, recipientId, recipientName, eventId }: DirectMessageModalProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/messages/${recipientId}?event=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen, recipientId, eventId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient: recipientId, event: eventId, text })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setText('');
            }
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div className="glass" style={{ width: '400px', height: '500px', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Chat with {recipientName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Direct Message</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#64748b', fontSize: '0.875rem' }}>
                            No messages yet. Say hello!
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMine = msg.sender._id === recipientId ? false : true;
                            return (
                                <div key={i} style={{
                                    maxWidth: '80%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '1rem',
                                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                                    background: isMine ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)',
                                    color: isMine ? '#818cf8' : '#cbd5e1',
                                    fontSize: '0.9rem',
                                    border: isMine ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                    position: 'relative'
                                }}>
                                    {msg.text}
                                    {isMine && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            marginLeft: '0.5rem',
                                            opacity: 0.7,
                                            color: msg.isRead ? 'var(--accent)' : 'inherit'
                                        }}>
                                            {msg.isRead ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message..."
                            className={styles.inputField}
                            style={{ margin: 0, padding: '0.625rem 1rem' }}
                        />
                        <button type="submit" disabled={loading || !text.trim()} className="cta" style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {loading ? '...' : '✈️'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
