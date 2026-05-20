import storage from '@/api/services/local-storage';

export function resolveMinisterId(
    user: Record<string, unknown> | null | undefined,
): string {
    if (!user) return '';
    const mid =
        user.ministerId ??
        (user.minister as Record<string, unknown> | undefined)?._id ??
        (user.minister as Record<string, unknown> | undefined)?.id ??
        user.minister;
    if (typeof mid === 'string' && mid.trim()) return mid.trim();
    if (typeof mid === 'number') return String(mid);
    const fallback = storage.getUserID();
    return typeof fallback === 'string' ? fallback : '';
}
