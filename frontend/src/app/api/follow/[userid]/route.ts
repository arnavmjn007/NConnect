import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

const FEED_SERVICE = process.env.FEED_SERVICE_URL;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userid: string }> }
) {
    return handler(params, "POST");
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userid: string }> }
) {
    return handler(params, "DELETE");
}

async function handler(
    params: Promise<{ userid: string }>,
    method: string
) {
    try {
        const { userid } = await params;
        const session = await auth0.getSession();
        const token = session?.tokenSet?.accessToken;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const res = await fetch(
            `${FEED_SERVICE}/follow/${encodeURIComponent(userid)}`,
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