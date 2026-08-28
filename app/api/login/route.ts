import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '../../index';
import { users } from '../../db/schema';
import { verifyPassword } from '@/app/lib/password';
import { AppError, toErrorResponse } from '@/app/lib/errors';
import { parseJsonBody } from '@/app/lib/http';
import { requireFields } from '@/app/lib/validate';
import { createSession } from '@/app/lib/session';

type LoginBody = {
    username: string;
    password: string;
}

async function authenticate(body: LoginBody) {
    const [ user ] = await db.select().from(users).where(eq(users.username, body.username));
    if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
        throw new AppError('Invalid username or password', 401);
    }
    return user;
}

export async function POST(request: Request) {
    try {
        const body = requireFields<LoginBody>(await parseJsonBody(request), {
            username: 'string',
            password: 'string',
        });

        const user = await authenticate(body);
        const accessToken = await createSession(user, request);
        return NextResponse.json({ ok: true, accessToken });
    } catch (error) {
        return toErrorResponse(error);
    }
}
