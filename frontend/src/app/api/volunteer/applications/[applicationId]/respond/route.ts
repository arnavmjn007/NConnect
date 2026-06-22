import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ applicationId: string }> }
) {
    try {
        const { applicationId } = await params;
        const { token } = await auth0.getAccessToken();
        const body = await request.json();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/volunteer/applications/${applicationId}/respond`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );
        const data = await res.json();

        if (res.ok && body.action === "ACCEPTED" && data.volunteerAuth0Id) {
            try {
                await fetch(`http://localhost:5000/chat/conversations`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ otherUserId: data.volunteerAuth0Id }),
                });
            } catch (chatErr) {
                console.error("Auto-chat creation failed:", chatErr);
            }
        }

        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("Volunteer respond error:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}