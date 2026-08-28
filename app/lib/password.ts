import argon2 from 'argon2';
import { AppError } from './errors';

export async function hashPassword(password: string): Promise<string> {
    if (password.length > 1024) {
        throw new AppError('Password is too long', 400);
    }
    return await argon2.hash(password, { type: argon2.argon2id, parallelism: 1 });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    if (password.length > 1024) {
        return false;
    }
    return await argon2.verify(hash, password);
}