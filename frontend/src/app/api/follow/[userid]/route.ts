import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    return handler(request, params, "POST");
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    return handler(request, params, "DELETE");
}

async function handler(
    request: NextRequest,
    params: Promise<{ userId: string }>,
    method: string
) {
    try {
        const { userId } = await params;
        const session = await auth0.getSession();
        const token = session?.tokenSet?.accessToken;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const res = await fetch(
            `http://localhost:5000/follow/${encodeURIComponent(userId)}`,
            {
                method,
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("Follow error:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}