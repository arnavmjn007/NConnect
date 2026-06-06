import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { token } = await auth0.getAccessToken();
        const body = await request.json();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resources/${params.id}/request`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return NextResponse.json(await res.json(), { status: res.status });
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}