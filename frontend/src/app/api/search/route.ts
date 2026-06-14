import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");
        if (!q?.trim()) {
            return NextResponse.json({ users: [], ngos: [], projects: [], resources: [] });
        }

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        try {
            const { token } = await auth0.getAccessToken();
            if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch {
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(q)}`,
            { headers }
        );
        if (!res.ok) {
            return NextResponse.json({ users: [], ngos: [], projects: [], resources: [] });
        }
        return NextResponse.json(await res.json());
    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json({ users: [], ngos: [], projects: [], resources: [] });
    }
}