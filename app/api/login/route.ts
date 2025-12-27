import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '../../index';
import { users, sessions } from '../../db/schema';
import { verifyPassword } from '@/app/lib/password';
import { cookies } from "next/headers";
import { randomBytes, createHmac } from 'crypto';

type LoginBody = {
    username: string;
    password: string;
}

const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET!;

function hashSessionToken(token: string): string {
  return createHmac("sha256", SESSION_TOKEN_SECRET)
    .update(token)
    .digest("hex");
}

async function checkIfUserExistsAndVerifyPassword(body: LoginBody) {
    try {
        const user = await db.select().from(users).where(eq(users.username, body.username));
        if (user.length !== 0) {
            const ok = await verifyPassword(user[0].passwordHash, body.password);
            if (!ok) {
                return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
            }
            return user[0];
        } else {
            return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
        }
    } catch (error) {
        throw error;
    }
}

async function createSession(userId: number) {
    const sessionToken = randomBytes(32).toString("hex");
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    await db.insert(sessions).values({
        userId,
        sessionTokenHash,
        expiresAt,
        revokedAt: null,
        createdAt: new Date(),
    });
    return { sessionToken, expiresAt };
}

async function setLoginCookie(sessionToken: string, expiresAt: Date) {
    const isProduction = process.env.NODE_ENV === 'production';
    (await cookies()).set('session-token', sessionToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
    });
}

export async function POST(request: Request) {
    try {
        const body: LoginBody = await request.json();
        if (!body.username || !body.password) {
            return NextResponse.json({ ok: false, error: "Missing required fields: username or password" }, { status: 400 });
        }
        if (typeof body.username !== 'string' || typeof body.password !== 'string') {
            return NextResponse.json({ ok: false, error: "Invalid data types for fields" }, { status: 400 });
        }
        const user = await checkIfUserExistsAndVerifyPassword(body);
        if (user instanceof NextResponse) {
            return user;
        }
        const { sessionToken, expiresAt } = await createSession(user.id);
        await setLoginCookie(sessionToken, expiresAt);
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }, { status: 400 });
    }
}