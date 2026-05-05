import { Types } from 'mongoose';
import type { PreferencePatchDTO } from './preference.dto';
import type {
    IUserPreferencesNotifications,
    IUserPreferencesTaste,
} from './preference.interface';

export type PreferenceSectionState = {
    taste: IUserPreferencesTaste;
    notifications: IUserPreferencesNotifications;
    playback: Record<string, unknown>;
    downloads: Record<string, unknown>;
    privacy: Record<string, unknown>;
};

function toObjectIds(ids: string[]): Types.ObjectId[] {
    return ids
        .filter(Types.ObjectId.isValid)
        .map((id) => new Types.ObjectId(id));
}

/**
 * Deep-merge preference PATCH into current section state (plain objects / ObjectIds).
 * Used by PreferenceService and unit-tested in isolation.
 */
export function mergePreferencePatch(
    current: PreferenceSectionState,
    patch: PreferencePatchDTO,
): PreferenceSectionState {
    const taste: IUserPreferencesTaste = {
        favoriteTopics: [...current.taste.favoriteTopics],
        favoriteMinisters: [...current.taste.favoriteMinisters],
    };
    const notifications: IUserPreferencesNotifications = {
        ...current.notifications,
    };
    const playback = { ...current.playback };
    const downloads = { ...current.downloads };
    const privacy = { ...current.privacy };

    if (patch.taste?.favoriteTopics !== undefined) {
        taste.favoriteTopics = [...patch.taste.favoriteTopics];
    }
    if (patch.taste?.favoriteMinisters !== undefined) {
        taste.favoriteMinisters = toObjectIds(patch.taste.favoriteMinisters);
    }
    if (patch.topics !== undefined) {
        taste.favoriteTopics = [...patch.topics];
    }
    if (patch.minister !== undefined) {
        taste.favoriteMinisters = toObjectIds(patch.minister);
    }

    if (patch.notifications) {
        if (patch.notifications.email !== undefined) {
            notifications.email = patch.notifications.email;
        }
        if (patch.notifications.push !== undefined) {
            notifications.push = patch.notifications.push;
        }
        if (patch.notifications.sms !== undefined) {
            notifications.sms = patch.notifications.sms;
        }
    }

    if (patch.playback !== undefined) {
        Object.assign(playback, patch.playback);
    }
    if (patch.downloads !== undefined) {
        Object.assign(downloads, patch.downloads);
    }
    if (patch.privacy !== undefined) {
        Object.assign(privacy, patch.privacy);
    }

    return { taste, notifications, playback, downloads, privacy };
}
