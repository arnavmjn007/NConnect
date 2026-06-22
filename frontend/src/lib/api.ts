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


export async function getResources(params?: { category?: string; status?: string; search?: string; resourceType?: string }) {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.resourceType) q.set("resourceType", params.resourceType);
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

export async function getMyResourceRequests() {
    const res = await fetch("/api/resources/my-requests");
    if (!res.ok) throw new Error("Failed to fetch your resource requests");
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

export interface MatchScore {
    projectId: string;
    matchScore: number;
}

export interface VolunteerScore {
    userId: string;
    score: number;
}

export interface NgoScore {
    ngoId: string;
    score: number;
}

export async function getProjectRecommendations(): Promise<MatchScore[]> {
    const res = await fetch("/api/recommend/projects");
    if (!res.ok) throw new Error("Failed to fetch project recommendations");
    return res.json();
}

export async function getVolunteerRecommendations(projectId: string): Promise<VolunteerScore[]> {
    const res = await fetch(`/api/recommend/volunteers/${projectId}`);
    if (!res.ok) throw new Error("Failed to fetch volunteer recommendations");
    return res.json();
}

export async function getNgoRecommendations(): Promise<NgoScore[]> {
    const res = await fetch("/api/recommend/ngos");
    if (!res.ok) throw new Error("Failed to fetch NGO recommendations");
    return res.json();
}

export async function summarizeText(text: string): Promise<string> {
    const res = await fetch("/api/recommend/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Failed to summarize");
    const data = await res.json();
    return data.summary;
}

export interface BasicUser {
    id: string;
    username: string;
    fullName: string;
    profileImageUrl: string;
}

export async function getUsersByIds(ids: string[]): Promise<BasicUser[]> {
    if (ids.length === 0) return [];
    const res = await fetch("/api/users/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids),
    });
    if (!res.ok) throw new Error("Failed to fetch user details");
    return res.json();
}