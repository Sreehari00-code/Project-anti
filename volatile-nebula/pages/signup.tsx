import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import Link from 'next/link';
import Head from 'next/head';
import styles from '@/styles/Auth.module.css';

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Signup failed');

            router.push('/login');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head><title>Sign Up | GuardianLines</title></Head>
            <div className={styles.authContainer}>
                <div className={styles.authBox}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>Join Us</h1>
                        <p className={styles.authSubtitle}>Create an account to get started</p>
                    </div>

                    {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Username</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Email Address</label>
                            <input
                                type="email"
                                className={styles.inputField}
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Password</label>
                            <input
                                type="password"
                                className={styles.inputField}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <ImageUpload
                                label="Profile Picture (Optional)"
                                onUpload={(url) => setFormData(prev => ({ ...prev, profilePicture: url }))}
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Already have an account?
                        <Link href="/login" className={styles.link}>Login</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
