import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { token } = await auth0.getAccessToken();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: `Backend error: ${text}` }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}