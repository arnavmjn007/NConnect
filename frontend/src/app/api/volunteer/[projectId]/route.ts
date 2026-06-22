import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const { token } = await auth0.getAccessToken();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/volunteer/${projectId}/status`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("Get volunteer status error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const { token } = await auth0.getAccessToken();
        const body = await request.json();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/volunteer/${projectId}/apply`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("Volunteer apply error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}