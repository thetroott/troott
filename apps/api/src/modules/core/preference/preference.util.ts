import { Types } from 'mongoose';
import type { IUserPreferencesDoc } from './preference.interface';
import type { PreferencePatchDTO } from './preference.dto';
import type { PreferenceSectionState } from './preference.merge';

export function docToPreferenceState(
    doc: IUserPreferencesDoc,
): PreferenceSectionState {
    return {
        taste: {
            favoriteTopics: [...doc.taste.favoriteTopics],
            favoriteMinisters: [...doc.taste.favoriteMinisters],
        },
        notifications: { ...doc.notifications },
        playback: { ...(doc.playback as Record<string, unknown>) },
        downloads: { ...(doc.downloads as Record<string, unknown>) },
        privacy: { ...(doc.privacy as Record<string, unknown>) },
    };
}

export function applyPreferenceStateToDoc(
    doc: IUserPreferencesDoc,
    state: PreferenceSectionState,
): void {
    doc.taste = state.taste;
    doc.notifications = state.notifications;
    doc.playback = state.playback;
    doc.downloads = state.downloads;
    doc.privacy = state.privacy;
}

export function legacyMinisterToObjectIds(raw: unknown): Types.ObjectId[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    const out: Types.ObjectId[] = [];
    for (const m of raw) {
        if (m instanceof Types.ObjectId) {
            out.push(m);
        } else if (typeof m === 'string' && Types.ObjectId.isValid(m)) {
            out.push(new Types.ObjectId(m));
        }
    }
    return out;
}

export function preferencePatchHasKeys(p: PreferencePatchDTO): boolean {
    return !!(
        (p.taste &&
            (p.taste.favoriteTopics !== undefined ||
                p.taste.favoriteMinisters !== undefined)) ||
        p.notifications ||
        (p.playback !== undefined && Object.keys(p.playback).length > 0) ||
        (p.downloads !== undefined && Object.keys(p.downloads).length > 0) ||
        (p.privacy !== undefined && Object.keys(p.privacy).length > 0) ||
        p.topics !== undefined ||
        p.minister !== undefined
    );
}

export function isMongoDuplicateKeyError(err: unknown): boolean {
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000
    );
}
