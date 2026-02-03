import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import styles from '@/styles/Auth.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login failed');

            // Update Auth Context state immediately
            login(data.user);

            if (data.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head><title>Login | GuardianLines</title></Head>
            <div className={styles.authContainer}>
                <div className={styles.authBox}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>Welcome Back</h1>
                        <p className={styles.authSubtitle}>Login to access your account</p>
                    </div>

                    {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
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

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Don't have an account?
                        <Link href="/signup" className={styles.link}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
