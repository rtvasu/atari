import { NextResponse } from 'next/server';

export class AppError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

export function toErrorResponse(error: unknown): NextResponse {
    if (error instanceof AppError) {
        return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error('Unhandled error:', error);
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
}
