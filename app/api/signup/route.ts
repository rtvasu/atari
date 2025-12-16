import { NextResponse } from 'next/server';

type SignUpBody = {
    username: string;
    password: string;
    phone: number;
}

export async function POST(request: Request) {
    let body: SignUpBody = await request.json();
    const email = body.username;
    return NextResponse.json({ ok: true });
}