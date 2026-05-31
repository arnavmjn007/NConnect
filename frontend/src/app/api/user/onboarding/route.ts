import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token } = await auth0.getAccessToken();
        let body = await request.json();

        if (body.role === "NGO") {
            body = {
                ...body,
                organizationName: body.occupation,
                missionStatement: body.bio,
                operatingLocations: body.location,
                ngoCategories: body.interests && body.interests.length > 0
                    ? body.interests.join(", ")
                    : null
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/onboarding`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: `Backend error: ${text}` }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}