import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import styles from '@/styles/Dashboard.module.css';

export default function ProfileView() {
    const { user, login } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, profilePicture })
            });

            if (res.ok) {
                const data = await res.json();
                login(data.user);
                setMessage('Profile updated successfully!');
            } else {
                const data = await res.json();
                setMessage(data.message || 'Update failed');
            }
        } catch (error) {
            setMessage('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('CRITICAL: This will permanently delete your account and all associated data. This cannot be undone. Proceed?')) return;

        try {
            const res = await fetch('/api/auth/profile', { method: 'DELETE' });
            if (res.ok) window.location.href = '/';
        } catch (error) {
            alert('Something went wrong');
        }
    };

    return (
        <div className={styles.profileGrid}>
            <div style={{ textAlign: 'center' }}>
                <img
                    src={profilePicture || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem', border: '4px solid rgba(99, 102, 241, 0.2)', padding: '4px' }}
                />
                <ImageUpload
                    onUpload={setProfilePicture}
                    currentImage={profilePicture}
                    label="Change Photo"
                />
            </div>

            <div>
                <form onSubmit={handleUpdate} style={{ maxWidth: '500px' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Full Name / Username</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Email Address</label>
                        <input
                            type="email"
                            className={styles.inputField}
                            value={user?.email || ''}
                            disabled
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        />
                    </div>

                    {message && (
                        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: message.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('success') ? '#4ade80' : '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {message}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="cta" style={{ border: 'none', width: 'auto', padding: '0.75rem 2rem' }}>
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>

                <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: '#f87171', marginBottom: '0.5rem', fontSize: '1rem' }}>Nuclear Option</h4>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button onClick={handleDelete} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        Delete account
                    </button>
                </div>
            </div>
        </div>
    );
}
