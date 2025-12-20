import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '../../index';
import { users } from '../../db/schema';
import { verifyPassword } from '@/app/lib/password';

type LoginBody = {
    username: string;
    password: string;
}

async function checkIfUserExistsAndVerifyPassword(body: LoginBody) {
    try {
        const user = await db.select().from(users).where(eq(users.username, body.username));
        if (user.length !== 0) {
            const ok = await verifyPassword(user[0].passwordHash, body.password);
            if (!ok) {
                return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
            }
            return NextResponse.json({ ok: true });
        } else {
            return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
        }
    } catch (error: any) {
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        let body: LoginBody = await request.json();

        if (!body.username || !body.password) {
            return NextResponse.json({ ok: false, error: "Missing required fields: username or password" }, { status: 400 });
        }
        if (typeof body.username !== 'string' || typeof body.password !== 'string') {
            return NextResponse.json({ ok: false, error: "Invalid data types for fields" }, { status: 400 });
        }
        await checkIfUserExistsAndVerifyPassword(body);
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message || 'An unexpected error occurred' }, { status: 400 });
    }
}