
export async function syncUser() {
    const res = await fetch("/api/user/sync", {
        method: "POST",
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Sync failed");
    }
    return res.json();
}

export async function getMe() {
    const res = await fetch("/api/user/me");
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch profile");
    }
    return res.json();
}

export async function submitOnboarding(data: object) {
    const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Onboarding failed");
    }
    return res.json();
}