import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { amt, rid, pid, scd } = await request.json();

        const verifyUrl = process.env.ESEWA_VERIFY_URL;
        if (!verifyUrl) {
            console.error("ESEWA_VERIFY_URL not configured");
            return NextResponse.json({ error: "Payment verification not configured" }, { status: 500 });
        }

        const params = new URLSearchParams({ amt: String(amt), rid, pid, scd });

        const res = await fetch(`${verifyUrl}?${params}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const text = await res.text();
        console.log("eSewa verify response:", text);

        const success = text.includes("<response_code>Success</response_code>");

        if (success) {
            return NextResponse.json({ verified: true, ref: rid });
        } else {
            return NextResponse.json(
                { verified: false, error: "Payment verification failed" },
                { status: 400 }
            );
        }
    } catch (err) {
        console.error("eSewa verify error:", err);
        return NextResponse.json({ error: "Verification request failed" }, { status: 500 });
    }
}