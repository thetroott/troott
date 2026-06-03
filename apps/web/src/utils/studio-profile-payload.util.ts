import type { CreatorResponseDTO } from '@/dtos/creator.dto';
import type { MinisterResponseDTO } from '@/dtos/minister.dto';

/** Normalize minister API `data` (raw doc, `{ minister }`, or DTO). */
export function parseMinisterResponsePayload(
    data: unknown,
): MinisterResponseDTO | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const raw = data as
        | { minister?: MinisterResponseDTO }
        | MinisterResponseDTO;
    if ('minister' in raw && raw.minister) {
        return normalizeMinisterDoc(raw.minister);
    }
    return normalizeMinisterDoc(raw as MinisterResponseDTO);
}

/** Normalize creator API `data` (raw doc, `{ creator }`, or DTO). */
export function parseCreatorResponsePayload(
    data: unknown,
): CreatorResponseDTO | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const raw = data as { creator?: CreatorResponseDTO } | CreatorResponseDTO;
    if ('creator' in raw && raw.creator) {
        return normalizeCreatorDoc(raw.creator);
    }
    return normalizeCreatorDoc(raw as CreatorResponseDTO);
}

function normalizeMinisterDoc(
    doc: MinisterResponseDTO & { _id?: string },
): MinisterResponseDTO | null {
    if ('_id' in doc || ('id' in doc && 'code' in doc)) {
        return {
            ...doc,
            id: doc.id ?? String(doc._id ?? ''),
        };
    }
    return null;
}

function normalizeCreatorDoc(
    doc: CreatorResponseDTO & { _id?: string },
): CreatorResponseDTO | null {
    if ('_id' in doc || ('id' in doc && 'code' in doc)) {
        return {
            ...doc,
            id: doc.id ?? String(doc._id ?? ''),
        };
    }
    return null;
}
