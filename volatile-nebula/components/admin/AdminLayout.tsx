import { useState, useEffect } from 'react'; // Added React imports
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Admin.module.css'; // Will create this CSS

export default function AdminLayout({ children, activeView, setView }: any) {
    const { logout, user } = useAuth();
    const router = useRouter();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'events', label: 'Events', icon: '📅' },
        { id: 'categories', label: 'Categories', icon: '🏷️' },
        { id: 'donations', label: 'Donations', icon: '💰' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>Admin Portal</h2>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeView === item.id ? styles.active : ''}`}
                            onClick={() => setView(item.id)}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className={styles.footer}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className={styles.content}>
                <header className={styles.header}>
                    <h3>{menuItems.find(i => i.id === activeView)?.label || 'Dashboard'}</h3>
                    <div className={styles.userProfile}>
                        {user?.username} ({user?.role})
                    </div>
                </header>
                <div className={styles.scrollableContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}
