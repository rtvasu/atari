const POSTGRES_UNIQUE_CONSTRAINT_VIOLATION = '23505';

function findPgErrorCode(error: unknown): { code?: unknown; constraint?: unknown } | undefined {
    if (!error || typeof error !== 'object') {
        return undefined;
    }
    if ('code' in error) {
        return error as { code?: unknown; constraint?: unknown };
    }
    if ('cause' in error) {
        return findPgErrorCode((error as { cause?: unknown }).cause);
    }
    return undefined;
}

export function isUniqueConstraintViolation(error: unknown, constraintName: string): boolean {
    const pgError = findPgErrorCode(error);
    return pgError?.code === POSTGRES_UNIQUE_CONSTRAINT_VIOLATION && pgError.constraint === constraintName;
}
