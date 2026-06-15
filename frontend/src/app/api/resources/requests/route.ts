import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { token } = await auth0.getAccessToken();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/resources/requests/incoming`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}