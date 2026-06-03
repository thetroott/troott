import type { UpdateSermonDTO } from '@/dtos/sermon.dto';
import { MediaStatus } from '@/dtos/sermon-media.types';
import { pickSermonDurationSeconds } from '@/utils/sermon-list-map.util';
import {
    isSermonDraftDocument,
    resolveStudioSermonShareLink,
} from '@/utils/sermon-info-map.util';
import {
    normalizeSermonVisibility,
    visibilityToIsPublic,
    type SermonVisibilityValue,
} from '@/utils/sermon-visibility.util';

export type SermonEditFormState = {
    title: string;
    description: string;
    category: string;
    tags: string[];
    visibility: SermonVisibilityValue;
    thumbnailPreview: string | null;
    shareableUrl: string;
    uploadStatus?: string;
    hasAudio: boolean;
    isDraft: boolean;
    durationLabel: string;
    itemId?: string;
};

function formatSecondsToLabel(totalSeconds: number): string {
    if (!totalSeconds || Number.isNaN(totalSeconds)) return '—';
    const s = Math.floor(totalSeconds % 60);
    const totalM = Math.floor(totalSeconds / 60);
    const h = Math.floor(totalM / 60);
    const m = totalM % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}

export function mapApiDocToEditForm(
    doc: Record<string, unknown>,
    sermonId: string,
): SermonEditFormState {
    const item = doc.item as Record<string, unknown> | undefined;
    const tags = Array.isArray(doc.tags)
        ? (doc.tags as unknown[]).map(String).filter(Boolean)
        : [];
    const imageSubdoc = doc.image as { item?: string } | undefined;
    const thumbnailPreview =
        typeof doc.imageUrl === 'string' && doc.imageUrl.trim()
            ? doc.imageUrl.trim()
            : typeof imageSubdoc?.item === 'string' && imageSubdoc.item.trim()
              ? imageSubdoc.item.trim()
              : null;

    return {
        title: String(doc.title ?? ''),
        description: String(doc.description ?? ''),
        category: String(doc.topic ?? ''),
        tags,
        visibility: normalizeSermonVisibility(
            doc.visibility,
            doc.isPublic as boolean | undefined,
        ),
        thumbnailPreview,
        shareableUrl: resolveStudioSermonShareLink(doc, sermonId),
        uploadStatus:
            item && typeof item.uploadStatus === 'string'
                ? item.uploadStatus
                : undefined,
        hasAudio: Boolean(
            doc.playbackUrl ||
                doc.manifestUrl ||
                (item?.item && String(item.item).trim()),
        ),
        isDraft: isSermonDraftDocument(doc),
        durationLabel: formatSecondsToLabel(pickSermonDurationSeconds(doc)),
        itemId:
            item && typeof item.itemId === 'string'
                ? item.itemId
                : undefined,
    };
}

export function editFormToUpdateDto(form: SermonEditFormState): UpdateSermonDTO {
    return {
        title: form.title.trim(),
        description: form.description.trim(),
        topic: form.category.trim() || undefined,
        tags: form.tags,
        visibility: form.visibility,
        isPublic: visibilityToIsPublic(form.visibility),
    };
}

export function buildPublishPayloadFromEditForm(
    form: SermonEditFormState,
    sermonId: string,
    ministerId: string,
    publishedBy: string,
    publishStatus: 'published' | 'draft',
): Record<string, unknown> {
    const release = new Date();
    return {
        title: form.title.trim(),
        description: form.description.trim(),
        topic: form.category.trim() || '',
        tags: form.tags,
        visibility: form.visibility,
        isPublic: visibilityToIsPublic(form.visibility),
        minister: ministerId || publishedBy,
        publishedBy,
        sermon: form.itemId?.trim() || sermonId,
        size: 0,
        duration: 0,
        preachedAt: release.toISOString(),
        preachedYear: String(release.getFullYear()),
        isSeries: false,
        status:
            publishStatus === 'published'
                ? MediaStatus.PUBLISHED
                : MediaStatus.DRAFT,
        isPublished: publishStatus === 'published',
    };
}

export function parseTagsInput(raw: string): string[] {
    return raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
}

export function tagsToInputValue(tags: string[]): string {
    return tags.join(', ');
}
