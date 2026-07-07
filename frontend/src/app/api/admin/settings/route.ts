import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const { token } = await auth0.getAccessToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(await res.json(), { status: res.status });
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { token } = await auth0.getAccessToken();
        const body = await request.json();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return NextResponse.json(await res.json(), { status: res.status });
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}