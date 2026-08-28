import { AppError } from './errors';

const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_MAX_LENGTH = 32;
const PHONE_PATTERN = /^\+?[0-9()\-.\s]{7,32}$/;

const PASSWORD_MIN_LENGTH = 8;

export function normalizeEmail(rawEmail: string): string {
    return rawEmail.trim().toLowerCase();
}

export function assertValidEmail(email: string): void {
    if (email.length > EMAIL_MAX_LENGTH) {
        throw new AppError('Email is too long', 400);
    }
    if (!EMAIL_PATTERN.test(email)) {
        throw new AppError('Invalid email address', 400);
    }
}

export function normalizePhone(rawPhone: string): string {
    return rawPhone.trim();
}

export function assertValidPhone(phone: string): void {
    if (phone.length > PHONE_MAX_LENGTH) {
        throw new AppError('Phone number is too long', 400);
    }
    if (!PHONE_PATTERN.test(phone)) {
        throw new AppError('Invalid phone number', 400);
    }
}

export function assertValidPassword(password: string): void {
    if (password.length < PASSWORD_MIN_LENGTH) {
        throw new AppError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`, 400);
    }
}
