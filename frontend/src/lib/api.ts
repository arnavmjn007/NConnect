import { auth0 } from './auth0';

const API = process.env.NEXT_PUBLIC_API_URL;

async function getToken(): Promise<string> {
    const session = await auth0.getSession();
    if (!session?.accessToken) throw new Error('Not authenticated');
    return session.accessToken as string;
}

export async function syncUser() {
    const token = await getToken();
    const res = await fetch(`${API}/api/auth/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
}

export async function getMe() {
    const token = await getToken();
    const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

export async function submitOnboarding(data: object) {
    const token = await getToken();
    const res = await fetch(`${API}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Onboarding failed');
    return res.json();
}