import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { token } = await auth0.getAccessToken();
        const body = await request.json().catch(() => ({}));
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${id}/request`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );
        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: text }, { status: res.status });
        }
        return NextResponse.json(await res.json());
    } catch (err) {
        console.error("Resource request error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}