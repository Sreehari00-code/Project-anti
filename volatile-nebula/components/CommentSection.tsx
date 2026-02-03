import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Event.module.css';

interface CommentProps {
    comment: any;
    allComments: any[];
    onReply: (text: string, parentId: string) => Promise<void>;
    user: any;
    depth: number;
}

function SingleComment({ comment, allComments, onReply, user, depth }: CommentProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    const replies = allComments.filter(c => c.parentId === comment._id);

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        setLoading(true);
        await onReply(replyText, comment._id);
        setReplyText('');
        setIsReplying(false);
        setLoading(false);
    };

    return (
        <div style={{
            marginBottom: '1rem',
            borderLeft: depth > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            paddingLeft: depth > 0 ? '1rem' : '0',
            marginTop: depth === 0 ? '2rem' : '0.5rem'
        }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <img
                    src={comment.user?.profilePicture || 'https://via.placeholder.com/32'}
                    alt={comment.user?.username}
                    style={{ width: depth === 0 ? '32px' : '24px', height: depth === 0 ? '32px' : '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '600', fontSize: depth === 0 ? '0.95rem' : '0.85rem' }}>{comment.user?.username}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: depth === 0 ? '1rem' : '0.9rem', lineHeight: '1.5' }}>{comment.text}</p>

                    {user && (
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '0.8rem',
                                padding: '0.25rem 0',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Reply
                        </button>
                    )}

                    {isReplying && (
                        <div style={{ marginTop: '0.75rem' }}>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Your reply..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    minHeight: '60px',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={handleReplySubmit}
                                    disabled={loading || !replyText.trim()}
                                    style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.3rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    {loading ? 'Posting...' : 'Post Reply'}
                                </button>
                                <button
                                    onClick={() => setIsReplying(false)}
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.3rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '0.5rem' }}>
                        {replies.map(reply => (
                            <SingleComment
                                key={reply._id}
                                comment={reply}
                                allComments={allComments}
                                onReply={onReply}
                                user={user}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CommentSection({ eventId }: { eventId: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/events/${eventId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error('Failed to fetch comments', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [eventId]);

    const handlePostComment = async (text: string, parentId: string | null = null) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/events/${eventId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, parentId })
            });

            if (res.ok) {
                const data = await res.json();
                setComments(prev => [data.comment, ...prev]);
                if (!parentId) setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const rootComments = comments.filter(c => !c.parentId);

    return (
        <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Discussion</h3>

            {user ? (
                <div style={{ marginBottom: '3rem' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What's on your mind?"
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1rem',
                            color: 'white',
                            minHeight: '100px',
                            resize: 'none',
                            fontSize: '1rem',
                            marginBottom: '1rem',
                            outline: 'none',
                        }}
                    />
                    <button
                        className="cta"
                        disabled={loading || !newComment.trim()}
                        onClick={() => {
                            setLoading(true);
                            handlePostComment(newComment).then(() => setLoading(false));
                        }}
                        style={{ border: 'none', padding: '0.75rem 2rem' }}
                    >
                        {loading ? 'Sharing...' : 'Share Comment'}
                    </button>
                </div>
            ) : (
                <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '3rem' }}>
                    <p style={{ color: '#94a3b8' }}>Sign in to join the conversation.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {rootComments.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No comments yet. Start the thread!</p>
                ) : rootComments.map(comment => (
                    <SingleComment
                        key={comment._id}
                        comment={comment}
                        allComments={comments}
                        onReply={handlePostComment}
                        user={user}
                        depth={0}
                    />
                ))}
            </div>
        </div>
    );
}
