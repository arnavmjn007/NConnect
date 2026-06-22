import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
    try {
        const { token } = await auth0.getAccessToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommend/projects`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("Get project recommendations error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}