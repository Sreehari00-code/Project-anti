import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

export default function CategoryManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const createCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory })
            });
            if (res.ok) {
                setNewCategory('');
                fetchCategories();
            } else {
                alert('Failed to create category');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStatus = async (cat: any) => {
        try {
            const res = await fetch(`/api/admin/categories/${cat._id}/disable`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disable: cat.isActive }) // If active, we disable (true)
            });
            if (res.ok) fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const updateName = async (id: string, newName: string) => {
        try {
            await fetch(`/api/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            // We don't refresh entire list to avoid input jump, maybe just silent update or refresh
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="New Category Name..."
                    className={styles.input}
                    style={{ marginBottom: 0, flex: 1 }}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <button onClick={createCategory} className={styles.actionBtn} style={{ background: 'var(--accent)', color: 'white', height: '100%' }}>
                    Add Category
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : categories.map(cat => (
                            <tr key={cat._id}>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={cat.name}
                                        onBlur={(e) => {
                                            if (e.target.value !== cat.name) updateName(cat._id, e.target.value);
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', fontSize: '1rem' }}
                                    />
                                </td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        background: cat.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: cat.isActive ? '#4ade80' : '#fca5a5',
                                        fontSize: '0.8rem'
                                    }}>
                                        {cat.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={`${styles.actionBtn} ${cat.isActive ? styles.btnDisable : styles.btnEnable}`}
                                        onClick={() => toggleStatus(cat)}
                                    >
                                        {cat.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
