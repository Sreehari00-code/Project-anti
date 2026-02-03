import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import ProfileView from '@/components/dashboard/ProfileView';
import MyEventsView from '@/components/dashboard/MyEventsView';
import MyDonationsView from '@/components/dashboard/MyDonationsView';
import MessagesView from '@/components/dashboard/MessagesView';
import styles from '@/styles/Dashboard.module.css';

export default function UserDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [view, setView] = useState('profile');

    useEffect(() => {
        if (router.query.view) {
            setView(router.query.view as string);
        }
    }, [router.query.view]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6366f1', fontSize: '1.2rem', fontWeight: 600 }}>Syncing your dashboard...</div>
    </div>;

    const renderContent = () => {
        switch (view) {
            case 'events': return <MyEventsView />;
            case 'donations': return <MyDonationsView />;
            case 'messages': return <MessagesView />;
            case 'profile':
            default: return <ProfileView />;
        }
    };

    const menuItems = [
        { id: 'profile', label: 'Overview', icon: '⚡' },
        { id: 'events', label: 'My Events', icon: '🎯' },
        { id: 'messages', label: 'Messages', icon: '💬' },
        { id: 'donations', label: 'Impact', icon: '💖' },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <>
            <Head>
                <title>Dashboard | GuardianLines</title>
            </Head>
            <div className={styles.container}>
                <aside className={styles.sidebar}>
                    <div className={styles.logoArea}>
                        <h2>GL Dashboard</h2>
                    </div>

                    <nav className={styles.nav}>
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`${styles.navItem} ${view === item.id ? styles.active : ''}`}
                                onClick={() => setView(item.id)}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <button onClick={logout} className={`${styles.navItem}`} style={{ marginTop: 'auto', color: '#ef4444' }}>
                        <span>🚪</span> Sign Out
                    </button>
                </aside>

                <main className={styles.mainContent}>
                    <header className={styles.header}>
                        <div className={styles.welcome}>
                            <h1>{getGreeting()}, {user.username}</h1>
                            <p>Here's what's happening with your initiatives today.</p>
                        </div>
                    </header>

                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        {renderContent()}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
