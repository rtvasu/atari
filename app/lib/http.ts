import { AppError } from './errors';

export async function parseJsonBody<T>(request: Request): Promise<T> {
    try {
        return await request.json() as T;
    } catch {
        throw new AppError('Invalid JSON body', 400);
    }
}
