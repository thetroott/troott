import type { Request } from 'express';

/** JWT middleware sets a minimal user payload; normalize id for services. */
export function getAuthUserId(req: Request): string {
    const u = req.user as { id?: string } | undefined;
    return String(u?.id ?? '');
}
