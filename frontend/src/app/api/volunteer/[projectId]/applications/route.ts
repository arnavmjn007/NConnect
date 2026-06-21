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
            `${process.env.NEXT_PUBLIC_API_URL}/api/volunteer/${projectId}/applications`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("Get applications error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}