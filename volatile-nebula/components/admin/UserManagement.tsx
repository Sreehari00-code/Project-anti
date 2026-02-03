import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (user: any) => {
        if (!confirm(`Are you sure you want to ${user.isActive ? 'disable' : 'enable'} this user?`)) return;

        try {
            const res = await fetch(`/api/auth/user/${user._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive })
            });
            if (res.ok) fetchUsers();
            else alert('Failed to update status');
        } catch (error) {
            console.error(error);
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user PERMANENTLY?')) return;

        try {
            const res = await fetch(`/api/auth/user/${id}`, { method: 'DELETE' });
            if (res.ok) fetchUsers();
            else alert('Failed to delete user');
        } catch (error) {
            console.error(error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search users..."
                    className={styles.input}
                    style={{ maxWidth: '300px', marginBottom: 0 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={fetchUsers} className={styles.actionBtn} style={{ background: 'var(--accent)', color: 'white' }}>
                    Refresh
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user._id} style={{ opacity: user.isActive ? 1 : 0.5 }}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#475569', overflow: 'hidden' }}>
                                        {user.profilePicture && <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%' }} />}
                                    </div>
                                    {user.username}
                                </td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        background: user.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: user.isActive ? '#4ade80' : '#fca5a5',
                                        fontSize: '0.8rem'
                                    }}>
                                        {user.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={`${styles.actionBtn} ${user.isActive ? styles.btnDisable : styles.btnEnable}`}
                                        onClick={() => toggleStatus(user)}
                                    >
                                        {user.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.btnDelete}`}
                                        onClick={() => deleteUser(user._id)}
                                    >
                                        Delete
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
