import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import DonationManagement from '@/components/admin/DonationManagement';
import AdminEventsView from '@/components/admin/AdminEventsView';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [view, setView] = useState('dashboard');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    const renderContent = () => {
        switch (view) {
            case 'users':
                return <UserManagement />;
            case 'categories':
                return <CategoryManagement />;
            case 'events':
                return <AdminEventsView />;
            case 'donations':
                return <DonationManagement />;
            case 'dashboard':
            default:
                return (
                    <div>
                        <div style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            padding: '3rem',
                            borderRadius: '1.5rem',
                            marginBottom: '2rem',
                            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                        }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Welcome back, Admin!</h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.9, color: 'white' }}>Manage users, events, and categories efficiently.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                                <h3>Quick Actions</h3>
                                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: '#cbd5e1' }}>
                                    <li>Review new User Signups</li>
                                    <li>Moderate Event Listings</li>
                                    <li>Check Donation Analytics</li>
                                </ul>
                            </div>
                            {/* Add more widgets here */}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>Admin Dashboard | GuardianLines</title>
            </Head>
            <AdminLayout activeView={view} setView={setView}>
                {renderContent()}
            </AdminLayout>
        </>
    );
}
