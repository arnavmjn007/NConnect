export async function syncUser() {
    const res = await fetch("/api/user/sync", { method: "POST" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Sync failed");
    return res.json();
}

export async function getMe() {
    const res = await fetch("/api/user/me");
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to fetch profile");
    return res.json();
}

export async function submitUserOnboarding(data: object) {
    const res = await fetch("/api/user/onboarding/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Onboarding failed");
    return res.json();
}

export async function submitNgoOnboarding(data: object) {
    const res = await fetch("/api/user/onboarding/ngo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Onboarding failed");
    return res.json();
}

export async function submitNgoVerification(data: object) {
    const res = await fetch("/api/user/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Verification failed");
    return res.json();
}

export async function updateProfile(data: object) {
    const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Update failed");
    return res.json();
}

export async function deleteAccount() {
    const res = await fetch("/api/user/account", { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Delete failed");
}

export async function uploadDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload/document", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
}