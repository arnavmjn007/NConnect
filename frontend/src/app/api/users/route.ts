import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role") || "NGO";
        const limit = searchParams.get("limit") || "8";
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users?role=${role}&limit=${limit}`
        );
        if (!res.ok) return NextResponse.json([]);
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json([]);
    }
}