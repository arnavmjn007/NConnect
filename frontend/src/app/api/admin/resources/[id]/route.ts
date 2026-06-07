import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { token } = await auth0.getAccessToken();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/resources/${id}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return NextResponse.json(await res.json(), { status: res.status });
    } catch (err) {
        console.error("Resource delete error:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}