import { resolveMinisterId } from '@/utils/minister-id.util';

/**
 * Id used for GET /sermon/minister/:id — minister profile _id, or user id when
 * sermons were created under a creator profile (minister field stores user id).
 */
export function resolveStudioSermonOwnerId(
    user: Record<string, unknown> | null | undefined,
    ministerIdFromContext?: string,
    creatorIdFromContext?: string,
): string {
    const ministerId = resolveMinisterId(user, ministerIdFromContext);
    if (ministerId) {
        return ministerId;
    }
    if (creatorIdFromContext?.trim()) {
        const uid =
            user && typeof user.id === 'string'
                ? user.id.trim()
                : user && typeof user._id === 'string'
                  ? user._id.trim()
                  : '';
        return uid || creatorIdFromContext.trim();
    }
    if (!user) {
        return '';
    }
    const uid =
        typeof user.id === 'string'
            ? user.id.trim()
            : typeof user._id === 'string'
              ? user._id.trim()
              : '';
    return uid;
}
