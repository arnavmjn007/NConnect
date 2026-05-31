"use client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter, usePathname } from "next/navigation";
import { getMe, syncUser } from "@/lib/api";

type DbUser = {
    id: string;
    email: string;
    fullName: string | null;
    username: string | null;
    bio: string | null;
    role: "USER" | "NGO" | "ADMIN";
    profileImageUrl: string | null;
    onboardingComplete: boolean;
    skills: string[];
    interests: string[];
    languages: string[];
    causes: string[];
};

const SYNC_KEY = "nconnect_synced";


async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 800): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const isLast = i === retries - 1;
            const message = (err instanceof Error ? err.message : "").toLowerCase();

            const isAuthError = 
                message.includes("not authenticated") ||
                message.includes("unauthorized") ||
                message.includes("401") ||
                message.includes("session");

            if (isLast || !isAuthError) throw err;
            console.warn(`Sync attempt ${i + 1} failed, retrying in ${delayMs * (i + 1)}ms...`);
            await new Promise(res => setTimeout(res, delayMs * (i + 1)));
        }
    }
    throw new Error("Max retries reached");
}

export function useAuth() {
    const { user, error, isLoading: isAuth0Loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const syncingRef = useRef(false);

    useEffect(() => {
        if (isAuth0Loading) return;

        if (!user) {
            sessionStorage.removeItem(SYNC_KEY);
            setDbUser(null);
            return;
        }

        if (syncingRef.current) return;
        syncingRef.current = true;

        const doSync = async () => {
            try {
                setIsSyncing(true);

                let profile: DbUser;

                if (sessionStorage.getItem(SYNC_KEY)) {
                    profile = await withRetry(() => getMe());
                } else {
                    profile = await withRetry(() => syncUser());
                    sessionStorage.setItem(SYNC_KEY, "1");
                }

                setDbUser(profile);

                if (!profile.onboardingComplete && pathname !== "/onboarding") {
                    router.push("/onboarding");
                }
            } catch (err) {
                console.error("Failed to load user profile:", err);
                sessionStorage.removeItem(SYNC_KEY);
            } finally {
                setIsSyncing(false);
                syncingRef.current = false;
            }
        };

        doSync();
    }, [user, isAuth0Loading, pathname, router]);


    return {
        user,
        dbUser,
        error,
        isAuthenticated: !!user,
        isLoading: isAuth0Loading || isSyncing,
    };
}