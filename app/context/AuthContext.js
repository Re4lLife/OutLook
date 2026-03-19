"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const verifyUser = async () => {
            const storedToken = localStorage.getItem("outlook_token");

            if (!storedToken) {
                setIsLoading(false);
                if (pathname.startsWith('/chat')) {
                    router.push('/get-started/sign-in');
                }
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: storedToken })
                });

                if (!res.ok) throw new Error("Verification failed");

                const data = await res.json();
                setUser(data.user);
                setToken(storedToken);

                document.cookie = `outlook_token=${storedToken}; path=/; SameSite=Strict; Secure`;

            } catch (error) {
                console.error("Auth error:", error.message);
                localStorage.removeItem("outlook_token");
                document.cookie = `outlook_token=; path=/; max-age=0`;
                router.push('/get-started/sign-in');
            } finally {
                setIsLoading(false);
            }
        };

        verifyUser();
    }, [router, pathname]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);