export function resolveMinisterId(
    user: Record<string, unknown> | null | undefined,
    ministerIdFromContext?: string,
): string {
    if (ministerIdFromContext?.trim()) {
        return ministerIdFromContext.trim();
    }
    if (!user) {
        return '';
    }
    const mid =
        user.ministerId ??
        (user.minister as Record<string, unknown> | undefined)?._id ??
        (user.minister as Record<string, unknown> | undefined)?.id ??
        user.minister;
    if (typeof mid === 'string' && mid.trim()) {
        return mid.trim();
    }
    if (typeof mid === 'number') {
        return String(mid);
    }
    return '';
}
