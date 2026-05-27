"use client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter, usePathname } from "next/navigation";
import { syncUser } from "@/lib/api";

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

export function useAuth() {
    const { user, error, isLoading: isAuth0Loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const hasSynced = useRef(false);

    useEffect(() => {
        if (!user || isAuth0Loading || hasSynced.current) return;

        hasSynced.current = true;

        const doSync = async () => {
            try {
                setIsSyncing(true);
                const profile: DbUser = await syncUser();
                setDbUser(profile);
                if (!profile.onboardingComplete && pathname !== "/onboarding") {
                    router.push("/onboarding");
                }
            } catch (err) {
                console.warn("Failed to sync user with backend:", err);
                hasSynced.current = false;
            } finally {
                setIsSyncing(false);
            }
        };
        const timer = setTimeout(() => {
            doSync();
        }, 1000);
        return () => clearTimeout(timer);
    }, [user, isAuth0Loading, pathname, router]);

    return {
        user,
        dbUser,
        error,
        isAuthenticated: !!user,
        isLoading: isAuth0Loading || isSyncing,
    };
}