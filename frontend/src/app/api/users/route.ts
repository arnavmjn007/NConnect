import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const auth0Id = searchParams.get("auth0Id");
        const role = searchParams.get("role") || "NGO";
        const limit = searchParams.get("limit") || "8";

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        try {
            const { token } = await auth0.getAccessToken();
            if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch { /* unauthenticated is fine */ }

        if (search) {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users?search=${encodeURIComponent(search)}`,
                { headers }
            );
            if (!res.ok) return NextResponse.json([]);
            return NextResponse.json(await res.json());
        }

        if (auth0Id) {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users?auth0Id=${encodeURIComponent(auth0Id)}`,
                { headers }
            );
            if (!res.ok) return NextResponse.json([]);
            return NextResponse.json(await res.json());
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users?role=${role}&limit=${limit}`,
            { headers }
        );
        if (!res.ok) return NextResponse.json([]);
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json([]);
    }
}