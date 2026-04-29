/**
 * Maps errors thrown from userService (e.g. createUser) to HTTP status codes
 * for consistent ErrorResponse usage in controllers.
 */
export function statusCodeForUserServiceError(
    message: string | undefined,
): number {
    const m = (message || '').trim();
    if (m === 'Forbidden') return 403;
    if (m === 'User already exists') return 400;
    if (m.startsWith('OAuth profile did not include')) return 400;
    if (m === 'User not found') return 404;
    if (/E11000|duplicate key|already exists/i.test(m)) return 400;
    return 500;
}
