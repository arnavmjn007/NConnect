import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        const headers: Record<string, string> = {};
        let currentUserSub: string | null = null;
        try {
            const session = await auth0.getSession();
            const token = session?.tokenSet?.accessToken;
            if (token) headers["Authorization"] = `Bearer ${token}`;
            currentUserSub = session?.user?.sub ?? null;
        } catch { /* unauthenticated */ }

        const [followersRes, followingRes] = await Promise.all([
            fetch(`http://localhost:5000/followers/${userId}`, { headers }),
            fetch(`http://localhost:5000/following/${userId}`, { headers }),
        ]);

        const followers: Array<{ follower_id: string }> = followersRes.ok ? await followersRes.json() : [];
        const following: Array<{ following_id: string }> = followingRes.ok ? await followingRes.json() : [];

        const isFollowing = currentUserSub
            ? followers.some(f => f.follower_id === currentUserSub)
            : false;

        return NextResponse.json({
            followerCount: followers.length,
            followingCount: following.length,
            isFollowing,
        });
    } catch (err) {
        console.error("Follow counts error:", err);
        return NextResponse.json({ followerCount: 0, followingCount: 0, isFollowing: false });
    }
}