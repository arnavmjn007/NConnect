import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { token } = await auth0.getAccessToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/audit-logs`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(await res.json(), { status: res.status });
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}