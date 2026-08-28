import { AppError } from './errors';

type FieldType = 'string' | 'number';

export function requireFields<T extends Record<string, unknown>>(
    body: Partial<Record<keyof T, unknown>>,
    spec: Record<keyof T, FieldType>
): T {
    for (const key of Object.keys(spec) as (keyof T)[]) {
        const value = body[key];
        if (value === undefined || value === null || value === '') {
            throw new AppError(`Missing required field: ${String(key)}`, 400);
        }
        if (typeof value !== spec[key]) {
            throw new AppError(`Invalid type for field: ${String(key)}`, 400);
        }
    }
    return body as T;
}
