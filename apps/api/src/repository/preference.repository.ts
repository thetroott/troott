import { Types } from 'mongoose';
import UserPreferences from '@/models/preference.model';
import type { IUserPreferencesDoc } from '@/modules/core/preference/preference.interface';
import { USER_PREFERENCES_SCHEMA_VERSION } from '@/modules/core/preference/preference.interface';

class PreferenceRepository {
    public async findByUserId(
        userId: string,
    ): Promise<IUserPreferencesDoc | null> {
        if (!Types.ObjectId.isValid(userId)) {
            return null;
        }
        return UserPreferences.findOne({
            user: new Types.ObjectId(userId),
        }).exec();
    }

    public async create(
        payload: Partial<IUserPreferencesDoc> & { user: Types.ObjectId },
    ): Promise<IUserPreferencesDoc> {
        return UserPreferences.create(payload);
    }

    public async save(doc: IUserPreferencesDoc): Promise<IUserPreferencesDoc> {
        return doc.save();
    }

    public async findAll(): Promise<IUserPreferencesDoc[]> {
        return UserPreferences.find({}).sort({ updatedAt: -1 }).exec();
    }

    public defaultSections(): Pick<
        IUserPreferencesDoc,
        | 'schemaVersion'
        | 'taste'
        | 'notifications'
        | 'playback'
        | 'downloads'
        | 'privacy'
    > {
        return {
            schemaVersion: USER_PREFERENCES_SCHEMA_VERSION,
            taste: { favoriteTopics: [], favoriteMinisters: [] },
            notifications: { email: true, push: true, sms: true },
            playback: {},
            downloads: {},
            privacy: {},
        };
    }
}

export const preferenceRepository = new PreferenceRepository();
