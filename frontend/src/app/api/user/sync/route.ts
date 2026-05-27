import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await auth0.getSession();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/sync`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        return NextResponse.json(
            { error: `Backend error: ${text}` },
            { status: res.status }
        );
    }

    return NextResponse.json(await res.json());
}