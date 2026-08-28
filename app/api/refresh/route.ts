import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AppError, toErrorResponse } from '@/app/lib/errors';
import { refreshSession } from '@/app/lib/session';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh-token')?.value;
        if (!refreshToken) {
            throw new AppError('No refresh token', 401);
        }

        const accessToken = await refreshSession(refreshToken, request);
        return NextResponse.json({ ok: true, accessToken });
    } catch (error) {
        return toErrorResponse(error);
    }
}
