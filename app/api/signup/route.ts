import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '../../index';
import { invites, users } from '../../db/schema';
import { hashPassword } from '@/app/lib/password';

const POSTGRES_UNIQUE_CONSTRAINT_VIOLATION = '23505';

type SignUpBody = {
    username: string;
    password: string;
    phone: number;
}

async function registerUser(body: SignUpBody) {
    try {
        const hashedPassword = await hashPassword(body.password);
        await db.insert(users).values({
            username: body.username,
            phone: body.phone.toString(),
            passwordHash: hashedPassword,
        });
    } catch (error: any) {
        if (error.code === POSTGRES_UNIQUE_CONSTRAINT_VIOLATION) {
            throw new Error('Username already exists');
        } else if (error.message === 'Password is too long') {
            throw error;
        } else {
            throw new Error('Registration failed due to a database error');
        }
    }
}

export async function POST(request: Request) {
    try {
        let body: SignUpBody = await request.json();
        
        if (!body.username || !body.password || !body.phone) {
            return NextResponse.json({ ok: false, error: "Missing required fields: username, password, or phone" }, { status: 400 });
        }
        if (typeof body.username !== 'string' || typeof body.password !== 'string' || typeof body.phone !== 'number') {
            return NextResponse.json({ ok: false, error: "Invalid data types for fields" }, { status: 400 });
        }
        
        const email = body.username;
        const user = await db.select().from(invites).where(eq(invites.email, email));
        if (user.length > 0) {
            await registerUser(body);
            return NextResponse.json({ ok: true });
        } else {
            return NextResponse.json({ ok: false, error: "You are not invited yet!" }, { status: 403 });
        }
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message || 'An unexpected error occurred' }, { status: 400 });
    }
}