/** Shared with `SermonsTable` — keep bin sort menu in sync with library. */
export const BIN_SORT_OPTIONS: { value: string; label: string }[] = [
    { value: '-updatedAt', label: 'Recently updated' },
    { value: '-createdAt', label: 'Date created (newest)' },
    { value: 'createdAt', label: 'Date created (oldest)' },
    { value: '-releaseDate', label: 'Release date (newest)' },
    { value: 'title', label: 'Title A–Z' },
    { value: '-title', label: 'Title Z–A' },
];

export function binSortLabel(sort: string): string {
    return (
        BIN_SORT_OPTIONS.find((o) => o.value === sort)?.label ??
        'Recently updated'
    );
}
