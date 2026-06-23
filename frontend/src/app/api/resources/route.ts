import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        try {
            const { token } = await auth0.getAccessToken();
            if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch {
            // Not authenticated — proceed without token
        }
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
            return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
        }
        const res = await fetch(
            `${backendUrl}/api/resources?${searchParams}`,
            { headers }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error("Backend resources error:", res.status, text);
            return NextResponse.json({ error: `Backend error: ${text}` }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (err) {
        console.error("Resources route error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to fetch resources" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { token } = await auth0.getAccessToken();
        const body = await request.json();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resources`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: `Backend error: ${text}` }, { status: res.status });
        }
        return NextResponse.json(await res.json());
    } catch (err) {
        console.error("Create resource error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}