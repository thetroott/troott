export function formatMonthlyListeners(
    count?: number | null,
): string | null {
    if (count == null || count <= 0 || !Number.isFinite(count)) {
        return null;
    }
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M monthly audience`;
    }
    if (count >= 1_000) {
        return `${Math.round(count / 1_000)}K monthly audience`;
    }
    return `${count} monthly listeners`;
}

export function ministerDisplayName(input: {
    ministerialName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}): string {
    const stage = input.ministerialName?.trim();
    if (stage) {
        return stage;
    }
    return `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim() || 'Minister';
}
