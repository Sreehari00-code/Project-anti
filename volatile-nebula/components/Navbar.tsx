import Link from 'next/link';
import styles from './Navbar.module.css';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className={`${styles.nav} glass`}>
            <div className={styles.logo}>
                <Link href="/">GuardianLines</Link>
            </div>

            {/* Desktop Links */}
            <div className={styles.links}>
                <Link href="/" className={styles.link}>Home</Link>
                <Link href="/events" className={styles.link}>Events</Link>
                {user && (
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className={styles.link}>
                        {user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                    </Link>
                )}
            </div>

            <div className={styles.actions} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user ? (
                    <>
                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Hi, {user.username}</span>
                        <button
                            onClick={logout}
                            className={styles.cta}
                            style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className={styles.link} style={{ marginRight: '1rem' }}>Login</Link>
                        <Link href="/signup" className={styles.cta}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
