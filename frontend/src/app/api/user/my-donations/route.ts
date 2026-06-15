import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { token } = await auth0.getAccessToken();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/my-donations`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return NextResponse.json([]);
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json([]);
    }
}