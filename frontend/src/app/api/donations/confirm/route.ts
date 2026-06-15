import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function POST(request: NextRequest) {
    try {
        const session = await auth0.getSession();
        const donorAuth0Id = session?.user?.sub ?? null;

        const body = await request.json();

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/donations/confirm`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-internal-secret": process.env.FEED_INTERNAL_SECRET || "nconnect_internal_secret_2026",
                },
                body: JSON.stringify({ ...body, donorAuth0Id }),
            }
        );

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("Donation confirm error:", err);
        return NextResponse.json({ error: "Failed to confirm donation" }, { status: 500 });
    }
}