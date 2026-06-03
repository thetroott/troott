import type { IDraft } from '@/context/draft/types';
import type { UpdateSermonDTO } from '@/dtos/sermon.dto';

/** Map GET /sermon/minister/:id list row to upload draft shape (id === sermon id). */
export function ministerSermonDocToDraft(doc: Record<string, unknown>): IDraft {
    const id = String(doc.id ?? doc._id ?? '');
    const tags = Array.isArray(doc.tags)
        ? doc.tags.map((t) => String(t))
        : [];
    const topic = String(doc.topic ?? doc.category ?? '');
    const imageSubdoc = doc.image as { item?: string } | undefined;
    const series = doc.series as { id?: string } | undefined;
    const thumbnailPreview =
        typeof doc.imageUrl === 'string' && doc.imageUrl.trim()
            ? doc.imageUrl.trim()
            : typeof imageSubdoc?.item === 'string' && imageSubdoc.item.trim()
              ? imageSubdoc.item.trim()
              : null;
    return {
        id,
        draftId: id,
        sermonId: id,
        title: String(doc.title ?? ''),
        description: String(doc.description ?? ''),
        tags,
        category: topic,
        isPublic:
            typeof doc.isPublic === 'boolean' ? doc.isPublic : undefined,
        file: null,
        thumbnail: null,
        thumbnailPreview,
        coverUploadStatus: thumbnailPreview ? 'uploaded' : 'idle',
        coverImageUrl: thumbnailPreview,
        coverUploadError: null,
        coverFileFingerprint: null,
        scheduledDate: null,
        seriesId:
            typeof doc.seriesId === 'string'
                ? doc.seriesId
                : typeof series?.id === 'string'
                  ? series.id
                  : undefined,
        createdAt: doc.createdAt
            ? new Date(String(doc.createdAt))
            : undefined,
        updatedAt: doc.updatedAt
            ? new Date(String(doc.updatedAt))
            : undefined,
    };
}

export function partialDraftToUpdateSermonDto(
    draft: Partial<IDraft>,
): UpdateSermonDTO {
    const dto: UpdateSermonDTO = {};
    if (draft.title !== undefined) dto.title = draft.title;
    if (draft.description !== undefined) dto.description = draft.description;
    if (draft.tags !== undefined) dto.tags = draft.tags;
    if (draft.category !== undefined) dto.topic = draft.category;
    if (draft.isPublic !== undefined) dto.isPublic = draft.isPublic;
    if (draft.visibility !== undefined) dto.visibility = draft.visibility;
    if (draft.seriesId !== undefined) {
        dto.isSeries = Boolean(draft.seriesId);
        dto.series = draft.seriesId;
    }
    return dto;
}

export function draftFromSermonIdAndPartial(
    sermonId: string,
    partial: Partial<IDraft>,
): IDraft {
    return {
        id: sermonId,
        draftId: sermonId,
        sermonId,
        title: partial.title ?? '',
        description: partial.description ?? '',
        tags: partial.tags ?? [],
        category: partial.category ?? '',
        isPublic: partial.isPublic,
        file: null,
        thumbnail: null,
        thumbnailPreview: partial.thumbnailPreview ?? null,
        scheduledDate: partial.scheduledDate,
        seriesId: partial.seriesId,
    };
}
