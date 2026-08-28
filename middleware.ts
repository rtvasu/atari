import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_ROUTES = new Set(['/login', '/signup']);
const enc = new TextEncoder();

async function hasValidAccessToken(request: NextRequest): Promise<boolean> {
    const accessToken = request.cookies.get('access-token')?.value;
    if (!accessToken) return false;
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) return false;
    try {
        await jwtVerify(accessToken, enc.encode(secret), { algorithms: ['HS256'] });
        return true;
    } catch {
        return false;
    }
}

async function tryRefreshAccessToken(request: NextRequest): Promise<Headers | null> {
    if (!request.cookies.has('refresh-token')) return null;

    try {
        const response = await fetch(new URL('/api/refresh', request.url), {
            method: 'POST',
            headers: { cookie: request.headers.get('cookie') ?? '' },
        });
        return response.ok ? response.headers : null;
    } catch {
        return null;
    }
}

function withRefreshedCookies(response: NextResponse, refreshedHeaders: Headers | null): NextResponse {
    if (refreshedHeaders) {
        for (const cookie of refreshedHeaders.getSetCookie()) {
            response.headers.append('set-cookie', cookie);
        }
    }
    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    let authenticated = await hasValidAccessToken(request);

    let refreshedHeaders: Headers | null = null;
    if (!authenticated) {
        refreshedHeaders = await tryRefreshAccessToken(request);
        authenticated = refreshedHeaders !== null;
    }

    if (authenticated && (AUTH_ROUTES.has(pathname) || pathname === '/')) {
        return withRefreshedCookies(NextResponse.redirect(new URL('/home', request.url)), refreshedHeaders);
    }

    if (!authenticated && (pathname === '/home' || pathname === '/')) {
        const knownUser = request.cookies.has('refresh-token');
        return NextResponse.redirect(new URL(knownUser ? '/login' : '/signup', request.url));
    }

    return withRefreshedCookies(NextResponse.next(), refreshedHeaders);
}

export const config = {
    matcher: ['/', '/home', '/login', '/signup'],
};
