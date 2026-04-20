import type { IUserPreferencesNotifications } from './preference.interface';

/** PATCH body for `/preference/me` and `/preference/:userId`. */
export interface PreferencePatchDTO {
    taste?: {
        favoriteTopics?: string[];
        /** Mongo ObjectId strings */
        favoriteMinisters?: string[];
    };
    notifications?: Partial<IUserPreferencesNotifications>;
    playback?: Record<string, unknown>;
    downloads?: Record<string, unknown>;
    privacy?: Record<string, unknown>;
    /** Legacy keys (same meaning as `taste`). */
    topics?: string[];
    /** Legacy: minister id strings */
    minister?: string[];
}

/** POST `/preference` body (initial set). */
export interface CreatePreferencesDTO {
    user: string;
    preferences?: {
        topics?: string[];
        minister?: string[];
    };
}

export type PreferenceResponseData = {
    userId: string;
    schemaVersion: number;
    taste: {
        favoriteTopics: string[];
        favoriteMinisters: string[];
    };
    notifications: IUserPreferencesNotifications;
    playback: Record<string, unknown>;
    downloads: Record<string, unknown>;
    privacy: Record<string, unknown>;
    /** True when taste has at least one topic or minister. */
    tasteComplete: boolean;
    /**
     * True when the listener has chosen at least one favorite topic and one favorite minister.
     * Use this (not `tasteComplete` alone) to decide whether post-signup taste onboarding is done before Home.
     */
    listenerTasteOnboardingComplete: boolean;
};
