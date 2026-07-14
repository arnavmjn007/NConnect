import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';

const FEED_SERVICE = process.env.FEED_SERVICE_URL;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const search = req.nextUrl.search;
    const url = `${FEED_SERVICE}/${path.join('/')}${search}`;

    const session = await auth0.getSession();
    const token = session?.tokenSet?.accessToken;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let body: string | undefined;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
        body = await req.text();
    }

    const res = await fetch(url, {
        method: req.method,
        headers,
        body,
    });

    const data = await res.text();
    return new NextResponse(data, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;