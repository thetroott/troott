/** Location state: open the same audio entry modal as My Sermons → Create sermon. */
export const OPEN_CREATE_SERMON_STATE = 'openCreateSermon' as const;

export type CreateSermonLocationState = {
    [OPEN_CREATE_SERMON_STATE]?: boolean;
    resumeSermonId?: string;
};

export function readOpenCreateSermonFromState(
    state: unknown,
): boolean {
    if (!state || typeof state !== 'object') {
        return false;
    }
    const s = state as CreateSermonLocationState & {
        openEntryModal?: boolean;
    };
    return Boolean(s[OPEN_CREATE_SERMON_STATE] || s.openEntryModal);
}
