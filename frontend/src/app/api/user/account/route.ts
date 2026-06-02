import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        const { token } = await auth0.getAccessToken();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/account`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: `Backend error: ${text}` }, { status: res.status });
        }
        return new NextResponse(null, { status: 204 });
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}