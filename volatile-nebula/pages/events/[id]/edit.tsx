import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Event.module.css';
import ImageUpload from '@/components/ImageUpload';

export default function EditEvent() {
    const router = useRouter();
    const { id } = router.query;
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Fetch Event Data
        fetch(`/api/events/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const e = data.event;
                    setFormData({
                        name: e.name || '',
                        description: e.description || '',
                        date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
                        location: e.location || '',
                        image: e.image || '',
                        category: e.category?._id || e.category || '',
                        maxParticipants: e.maxParticipants || '',
                    });
                }
                setLoading(false);
            });

        // Fetch categories
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data.success) setCategories(data.categories);
            });
    }, [id]);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.push('/dashboard?view=events');
            } else {
                const data = await res.json();
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            alert('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <>
            <Head>
                <title>Edit Event | GuardianLines</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Edit <span className="gradient-text">Event</span></h1>
                </div>

                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Event Name</label>
                            <input name="name" value={formData.name} required className={styles.input} onChange={handleChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Category</label>
                            <select name="category" className={styles.input} onChange={handleChange} value={formData.category}>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date</label>
                            <input type="date" name="date" value={formData.date} required className={styles.input} onChange={handleChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Location</label>
                            <input name="location" value={formData.location} required className={styles.input} onChange={handleChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description</label>
                            <textarea name="description" value={formData.description} className={styles.textarea} onChange={handleChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Max Participants</label>
                            <input type="number" name="maxParticipants" value={formData.maxParticipants} required className={styles.input} onChange={handleChange} min="1" />
                        </div>

                        <div className={styles.formGroup}>
                            <ImageUpload
                                label="Update Cover Image"
                                currentImage={formData.image}
                                onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className={styles.submitBtn} disabled={saving} style={{ flex: 2 }}>
                                {saving ? 'Saving...' : 'Update Event'}
                            </button>
                            <button type="button" onClick={() => router.back()} className={styles.submitBtn} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
