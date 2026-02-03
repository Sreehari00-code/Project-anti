import { useState, useEffect } from 'react';
import styles from '@/styles/Dashboard.module.css';

export default function MessagesView() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConv) {
            const interval = setInterval(() => {
                fetchMessages(selectedConv);
            }, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [selectedConv]);

    const fetchMessages = async (conv: any) => {
        setSelectedConv(conv);
        try {
            const res = await fetch(`/api/messages/${conv.otherUser._id}?event=${conv.event._id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                // Refresh conversations to update unread status
                fetchConversations();
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedConv) return;

        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: selectedConv.otherUser._id,
                    event: selectedConv.event._id,
                    text: replyText
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setReplyText('');
            }
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div style={{ color: '#94a3b8' }}>Loading conversations...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: 'calc(100vh - 250px)' }}>
            {/* Conversations List */}
            <div className="glass" style={{ borderRadius: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Inbox</div>
                {conversations.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>No conversations yet.</div>
                ) : (
                    conversations.map((conv, i) => (
                        <div
                            key={i}
                            onClick={() => fetchMessages(conv)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                background: selectedConv?.otherUser._id === conv.otherUser._id && selectedConv?.event._id === conv.event._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={conv.otherUser.profilePicture || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                                        {conv.otherUser.username}
                                        {conv.unread && <span style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }}></span>}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.event.name}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Area */}
            {selectedConv ? (
                <div className="glass" style={{ borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontWeight: '600' }}>{selectedConv.otherUser.username}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Re: {selectedConv.event.name}</div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.sender._id === selectedConv.otherUser._id ? 'flex-start' : 'flex-end',
                                background: msg.sender._id === selectedConv.otherUser._id ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.1)',
                                padding: '0.75rem 1rem',
                                borderRadius: '1rem',
                                maxWidth: '70%',
                                fontSize: '0.9rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: msg.sender._id === selectedConv.otherUser._id ? '#cbd5e1' : '#818cf8',
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '0.5rem'
                            }}>
                                <span>{msg.text}</span>
                                {msg.sender._id !== selectedConv.otherUser._id && (
                                    <span style={{ fontSize: '0.7rem', opacity: 0.7, color: msg.isRead ? 'var(--accent)' : 'inherit', minWidth: '15px' }}>
                                        {msg.isRead ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend} style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                className={styles.inputField}
                                style={{ margin: 0 }}
                            />
                            <button disabled={sending || !replyText.trim()} className="cta" style={{ border: 'none', padding: '0 1.5rem' }}>
                                {sending ? '...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="glass" style={{ borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    Select a conversation to start chatting
                </div>
            )}
        </div>
    );
}
