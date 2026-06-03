export type SermonVisibilityValue = 'public' | 'private' | 'unlisted';

const VALID = new Set<SermonVisibilityValue>([
    'public',
    'private',
    'unlisted',
]);

export function normalizeSermonVisibility(
    visibility: unknown,
    isPublic?: boolean,
): SermonVisibilityValue {
    if (
        typeof visibility === 'string' &&
        VALID.has(visibility as SermonVisibilityValue)
    ) {
        return visibility as SermonVisibilityValue;
    }
    if (isPublic === true) {
        return 'public';
    }
    if (isPublic === false) {
        return 'private';
    }
    return 'public';
}

export function visibilityLabel(visibility: SermonVisibilityValue): string {
    switch (visibility) {
        case 'private':
            return 'Private';
        case 'unlisted':
            return 'Unlisted';
        case 'public':
        default:
            return 'Public';
    }
}

export function visibilityToIsPublic(visibility: SermonVisibilityValue): boolean {
    return visibility !== 'private';
}

const PIPELINE_BLOCKING = new Set([
    'uploaded',
    'extracting',
    'processing',
]);

export function isUploadStatusBlockingVisibilityChange(
    uploadStatus: string | undefined,
): boolean {
    if (!uploadStatus) {
        return false;
    }
    return PIPELINE_BLOCKING.has(uploadStatus.toLowerCase());
}
