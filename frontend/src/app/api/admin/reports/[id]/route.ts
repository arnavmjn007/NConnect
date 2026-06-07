import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { token } = await auth0.getAccessToken();
        const body = await request.json();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/${id}`,
            {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );
        return NextResponse.json(await res.json(), { status: res.status });
    } catch (err) {
        console.error("Report patch error:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}