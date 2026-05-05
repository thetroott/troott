import { ContentState, ContentStatus } from '../../../utils/enums.util';

/** Raw sermon-like object (lean / JSON) for teaser eligibility checks. */
export function isSermonPublicTeaserEligible(
    doc: Record<string, unknown>,
): boolean {
    if (doc.isPublic === false) {
        return false;
    }
    if (doc.status !== ContentStatus.PUBLISHED) {
        return false;
    }
    const st = doc.state;
    if (st === ContentState.DELETED || st === ContentState.BROKEN) {
        return false;
    }
    return true;
}

export function buildSermonTeaserPayload(doc: Record<string, unknown>) {
    const minister = doc.minister;
    let ministerSummary: { id?: string; name?: string } | undefined;
    if (minister && typeof minister === 'object' && minister !== null) {
        const m = minister as Record<string, unknown>;
        const id =
            m._id != null
                ? String(m._id)
                : m.id != null
                  ? String(m.id)
                  : undefined;
        const fn = typeof m.firstName === 'string' ? m.firstName : '';
        const ln = typeof m.lastName === 'string' ? m.lastName : '';
        const name = [fn, ln].filter(Boolean).join(' ').trim() || undefined;
        ministerSummary = { id, name };
    }

    return {
        id: String(doc._id ?? doc.id ?? ''),
        title: doc.title,
        description: doc.description,
        imageUrl: doc.imageUrl,
        duration: doc.duration,
        topic: doc.topic,
        shareableUrl: doc.shareableUrl,
        minister: ministerSummary,
    };
}
