import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        try {
            const { token } = await auth0.getAccessToken();
            if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch {
        }
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`,
            { headers }
        );
        if (!res.ok) {
            return NextResponse.json({ error: "Profile not found" }, { status: res.status });
        }
        return NextResponse.json(await res.json());
    } catch (err) {
        console.error("Public profile error:", err);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}