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


export async function getProjects(params?: { category?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    const res = await fetch(`/api/projects?${q}`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
}

export async function createProject(data: object) {
    const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to create project");
    return res.json();
}

export async function getMyProjects() {
    const res = await fetch("/api/projects/my");
    if (!res.ok) throw new Error("Failed to fetch your projects");
    return res.json();
}


export async function getResources(params?: { category?: string; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    const res = await fetch(`/api/resources?${q}`);
    if (!res.ok) throw new Error("Failed to fetch resources");
    return res.json();
}

export async function createResource(data: object) {
    const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to create resource");
    return res.json();
}

export async function getMyResources() {
    const res = await fetch("/api/resources/my");
    if (!res.ok) throw new Error("Failed to fetch your resources");
    return res.json();
}

export async function requestResource(id: string, message?: string) {
    const res = await fetch(`/api/resources/${id}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
    return res.json();
}