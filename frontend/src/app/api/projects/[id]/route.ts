import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`);
        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: text }, { status: res.status });
        }
        return NextResponse.json(await res.json());
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to fetch project" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { token } = await auth0.getAccessToken();
        const body = await request.json();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
            method: "PUT",
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
    } catch (err) {
        console.error("Update project error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { token } = await auth0.getAccessToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: text }, { status: res.status });
        }
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Delete project error:", err);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}