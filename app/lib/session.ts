import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import db from '../index';
import { refreshTokens, users } from '../db/schema';
import { ACCESS_TTL_SECONDS, generateRefreshToken, hashToken, signAccessToken } from './token';
import { AppError } from './errors';

const REFRESH_TOKEN_TTL_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

function extractIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded ? forwarded.split(',')[0].trim() :
              request.headers.get('x-real-ip') ||
              'unknown';
}

async function setSessionCookies(accessToken: string, refreshToken: string, refreshExpiresAt: Date): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieStore = await cookies();
    cookieStore.set('refresh-token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        expires: refreshExpiresAt,
    });
    cookieStore.set('access-token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_TTL_SECONDS,
    });
}

export async function createSession(
    user: { id: string; username: string },
    request: Request,
    options?: { failureMessage?: string }
): Promise<string> {
    try {
        const userAgent = request.headers.get('user-agent') || null;
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MILLISECONDS);

        const refreshToken = generateRefreshToken();
        await db.insert(refreshTokens).values({
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt,
            userAgent,
            ipAddress: extractIp(request),
        });

        const accessToken = await signAccessToken({ sub: user.id, email: user.username });
        await setSessionCookies(accessToken, refreshToken, expiresAt);

        return accessToken;
    } catch (error) {
        console.error('createSession failed:', error);
        throw new AppError(options?.failureMessage ?? 'Could not start your session. Please log in.', 500);
    }
}

export async function refreshSession(refreshToken: string, request: Request): Promise<string> {
    const tokenHash = hashToken(refreshToken);
    const [existing] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));

    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
        throw new AppError('Session expired. Please log in again.', 401);
    }

    const [user] = await db.select().from(users).where(eq(users.id, existing.userId));
    if (!user) {
        throw new AppError('Session expired. Please log in again.', 401);
    }

    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MILLISECONDS);

    const [newRow] = await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        expiresAt,
        userAgent: request.headers.get('user-agent') || null,
        ipAddress: extractIp(request),
    }).returning();

    await db.update(refreshTokens)
        .set({ revokedAt: new Date(), replacedByTokenId: newRow.id, lastUsedAt: new Date() })
        .where(eq(refreshTokens.id, existing.id));

    const accessToken = await signAccessToken({ sub: user.id, email: user.username });
    await setSessionCookies(accessToken, newRefreshToken, expiresAt);

    return accessToken;
}
