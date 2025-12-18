import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '../../index';
import { invites } from '../../db/schema';

type SignUpBody = {
    username: string;
    password: string;
    phone: number;
}

export async function POST(request: Request) {
    let body: SignUpBody = await request.json();
    const email = body.username;
    const user = await db.select().from(invites).where(eq(invites.email, email));
    if (user.length > 0) {
        return NextResponse.json({ ok: true });
    } else {
        return NextResponse.json({ ok: false, error: "You are not invited yet!" }, { status: 403 });
    }
}