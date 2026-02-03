import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface User {
    id: string; // Internal MongoDB ID
    username: string;
    email: string;
    role: string;
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in (e.g. valid cookie)
        // For this demo, we'll try to fetch a protected endpoint or just check a local storage flag 
        // BUT since we used HttpOnly cookies, we can't read them in JS.
        // We should hit an endpoint like /api/auth/me.
        // I'll implement a simple /api/auth/me endpoint effectively by checking if we have a user.
        // For now, let's rely on the pages setting the state, or better: implement the check.
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await fetch('/api/auth/me'); // We need to create this
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' }); // Need this too
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
