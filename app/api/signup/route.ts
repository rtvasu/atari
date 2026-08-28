import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '../../index';
import { invites, users } from '../../db/schema';
import { hashPassword } from '@/app/lib/password';
import { AppError, toErrorResponse } from '@/app/lib/errors';
import { parseJsonBody } from '@/app/lib/http';
import { requireFields } from '@/app/lib/validate';
import { isUniqueConstraintViolation } from '@/app/lib/db-errors';
import { createSession } from '@/app/lib/session';
import { normalizeEmail, assertValidEmail, normalizePhone, assertValidPhone, assertValidPassword } from '@/app/lib/sanitize';

const USERS_USERNAME_UNIQUE_CONSTRAINT = 'users_username_unique';

type SignUpBody = {
    username: string;
    password: string;
    phone: string;
}

async function assertInvited(email: string) {
    const invitedUsers = await db.select().from(invites).where(eq(invites.email, email));
    if (invitedUsers.length === 0) {
        throw new AppError('You are not invited yet!', 403);
    }
}

async function createUser(body: SignUpBody) {
    try {
        const hashedPassword = await hashPassword(body.password);
        const [ user ] = await db.insert(users).values({
            username: body.username,
            phone: body.phone,
            passwordHash: hashedPassword,
        }).returning();
        return user;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        if (isUniqueConstraintViolation(error, USERS_USERNAME_UNIQUE_CONSTRAINT)) {
            throw new AppError('Username already exists', 409);
        }
        console.error('createUser failed:', error);
        throw new AppError('Registration failed. Please try again later.', 500);
    }
}

export async function POST(request: Request) {
    try {
        const body = requireFields<SignUpBody>(await parseJsonBody(request), {
            username: 'string',
            password: 'string',
            phone: 'string',
        });

        body.username = normalizeEmail(body.username);
        body.phone = normalizePhone(body.phone);
        assertValidEmail(body.username);
        assertValidPhone(body.phone);
        assertValidPassword(body.password);

        await assertInvited(body.username);
        const user = await createUser(body);
        const accessToken = await createSession(user, request, {
            failureMessage: 'Account created, but we could not start your session. Please log in.',
        });
        return NextResponse.json({ ok: true, accessToken });
    } catch (error) {
        return toErrorResponse(error);
    }
}
