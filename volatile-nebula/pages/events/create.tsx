import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Dashboard.module.css';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';

export default function CreateEvent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: '',
        image: '',
        category: '',
        maxParticipants: '',
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.categories);
                    if (data.categories.length > 0) {
                        setFormData(prev => ({ ...prev, category: data.categories[0]._id }));
                    }
                }
            });
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create event');

            router.push('/events');
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    return (
        <>
            <Head>
                <title>Create Event | GuardianLines</title>
            </Head>
            <div className={styles.container}>
                <aside className={styles.sidebar}>
                    <div className={styles.logoArea}>
                        <h2 onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>GuardianLines</h2>
                    </div>
                    <nav className={styles.nav}>
                        <button className={styles.navItem} onClick={() => router.push('/dashboard')}>
                            <span>🏠</span> Dashboard
                        </button>
                        <button className={`${styles.navItem} ${styles.active}`}>
                            <span>✨</span> Create New
                        </button>
                    </nav>
                </aside>

                <main className={styles.mainContent}>
                    <header className={styles.header}>
                        <div className={styles.welcome}>
                            <h1>Launch a <span className="gradient-text">Movement</span></h1>
                            <p>Bring people together for a cause that matters.</p>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
                        <div className={styles.grid}>
                            <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Event Name</label>
                                    <input name="name" required className={styles.inputField} onChange={handleChange} placeholder="e.g. Wildlife Preservation Workshop" />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Full Description</label>
                                    <textarea name="description" className={styles.inputField} style={{ minHeight: '120px', resize: 'vertical' }} onChange={handleChange} placeholder="What is the mission? What should attendees expect?" />
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Category</label>
                                    <select name="category" className={styles.inputField} onChange={handleChange} value={formData.category}>
                                        {categories.map(cat => (cat.isActive || cat._id === formData.category) && (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Date of Event</label>
                                    <input type="date" name="date" required className={styles.inputField} onChange={handleChange} />
                                </div>
                                <div>
                                    <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Max Participants</label>
                                    <input type="number" name="maxParticipants" required className={styles.inputField} onChange={handleChange} placeholder="100" min="1" />
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Location</label>
                                    <input name="location" required className={styles.inputField} onChange={handleChange} placeholder="City, State or Virtual Link" />
                                </div>
                                <ImageUpload
                                    label="Cover Image"
                                    onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => router.back()} className={styles.navItem} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                Cancel
                            </button>
                            <button type="submit" className="cta" disabled={loading} style={{ border: 'none', padding: '0.75rem 2.5rem' }}>
                                {loading ? 'Publishing...' : 'Publish Event'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}
