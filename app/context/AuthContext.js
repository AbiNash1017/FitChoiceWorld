"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get the ID token
                const token = await firebaseUser.getIdToken();

                // Set cookie for middleware
                document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;

                // Fetch user data from MongoDB
                try {
                    const response = await fetch('/api/user/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        // setUser({ ...firebaseUser, ...userData });
                        setUser({
                            ...userData,
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            phoneNumber: firebaseUser.phoneNumber,
                            photoURL: firebaseUser.photoURL,
                            getIdToken: (forceRefresh) => firebaseUser.getIdToken(forceRefresh),
                        });
                    } else {
                        // If user not found in DB, just set firebase user (might be first login/onboarding)
                        setUser(firebaseUser);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(firebaseUser);
                }
            } else {
                // Remove cookie
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            router.push("/login"); // Or wherever you want to redirect
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
