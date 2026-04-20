import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

/** Listener taste / discovery steering (not library saves). */
export interface IUserPreferencesTaste {
    favoriteTopics: string[];
    favoriteMinisters: ObjectId[];
}

export interface IUserPreferencesNotifications {
    email: boolean;
    push: boolean;
    sms: boolean;
}

export interface IUserPreferencesDoc extends Document {
    user: ObjectId;
    schemaVersion: number;
    taste: IUserPreferencesTaste;
    notifications: IUserPreferencesNotifications;
    /** Reserved for streaming-style settings (quality, gapless, etc.). */
    playback: Record<string, unknown>;
    downloads: Record<string, unknown>;
    privacy: Record<string, unknown>;

    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export const USER_PREFERENCES_SCHEMA_VERSION = 1;
