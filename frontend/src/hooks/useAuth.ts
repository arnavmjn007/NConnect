"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { syncUser as syncUserWithBackend } from "@/lib/api";

export function useAuth() {
    const { user, error, isLoading: isAuth0Loading } = useUser();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (user && !isAuth0Loading) {
            const sync = async () => {
                try {
                    setIsSyncing(true);
                    await syncUserWithBackend();
                } catch (err) {
                    console.error("Failed to sync user:", err);
                } finally {
                    setIsSyncing(false);
                }
            };
            sync();
        }
    }, [user, isAuth0Loading]);

    return {
        user,
        error,
        isAuthenticated: !!user,
        isLoading: isAuth0Loading || isSyncing,
    };
}