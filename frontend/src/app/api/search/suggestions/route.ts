import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");
        if (!q?.trim()) return NextResponse.json([]);

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/search/suggestions?q=${encodeURIComponent(q)}`
        );
        if (!res.ok) return NextResponse.json([]);
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json([]);
    }
}