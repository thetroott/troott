import { MediaStatus } from '@/dtos/sermon-media.types';

/** Matches API `validateDeletePolicy` when `sermonStatus === MediaStatus.PUBLISHED`. */
export function isSermonPublishedStatus(status: unknown): boolean {
    return String(status ?? '').toLowerCase() === MediaStatus.PUBLISHED;
}

export function isSermonPublishedDocument(
    doc: Record<string, unknown>,
): boolean {
    return isSermonPublishedStatus(doc.status ?? doc.state);
}

/** List/grid row — `mapApiSermonToTableRow` sets `publicationStatus`. */
export function isSermonPublishedCatalogRow(row: {
    publicationStatus?: string;
}): boolean {
    return row.publicationStatus === 'published';
}

/**
 * Studio ministers/creators cannot move published sermons to bin
 * (`PUT /sermon/move-to-bin/:id` returns 403).
 */
export function canStudioUserMoveSermonToBin(row: {
    publicationStatus?: string;
}): boolean {
    return !isSermonPublishedCatalogRow(row);
}

/**
 * Studio ministers/creators cannot permanently delete published sermons
 * (`DELETE /sermon/delete/:id` returns 403).
 */
export function canStudioUserPermanentlyDeleteSermon(row: {
    publicationStatus?: string;
}): boolean {
    return !isSermonPublishedCatalogRow(row);
}

export const SERMON_PUBLISHED_TRASH_POLICY_MESSAGE =
    'Published sermons cannot be moved to the bin.';

export const SERMON_PUBLISHED_DELETE_POLICY_MESSAGE =
    'Published sermons cannot be permanently deleted.';
