import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { amt, rid, pid, scd } = await request.json();
        const params = new URLSearchParams({ amt, rid, pid, scd });
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_ESEWA_VERIFY_URL}?${params}`,
            { method: "POST" }
        );

        const text = await res.text();

        const success = text.includes("<response_code>Success</response_code>");

        if (success) {
            return NextResponse.json({ verified: true, ref: rid });
        } else {
            return NextResponse.json({ verified: false, error: "Payment verification failed" }, { status: 400 });
        }
    } catch (err) {
        console.error("eSewa verify error:", err);
        return NextResponse.json({ error: "Verification request failed" }, { status: 500 });
    }
}