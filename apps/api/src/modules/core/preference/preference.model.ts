import mongoose, { Model, Schema } from 'mongoose';
import { DbModels } from '@/utils/enums.util';
import {
    IUserPreferencesDoc,
    USER_PREFERENCES_SCHEMA_VERSION,
} from './preference.interface';

const UserPreferencesSchema = new Schema<IUserPreferencesDoc>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            unique: true,
            index: true,
        },
        schemaVersion: {
            type: Number,
            default: USER_PREFERENCES_SCHEMA_VERSION,
        },
        taste: {
            favoriteTopics: [{ type: String }],
            favoriteMinisters: [
                { type: Schema.Types.ObjectId, ref: DbModels.MINISTER },
            ],
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
        },
        playback: { type: Schema.Types.Mixed, default: {} },
        downloads: { type: Schema.Types.Mixed, default: {} },
        privacy: { type: Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret: Record<string, unknown>) {
                ret.id = ret._id?.toString?.();
                return ret;
            },
        },
    },
);

const UserPreferences: Model<IUserPreferencesDoc> =
    mongoose.models[DbModels.USER_PREFERENCES] ||
    mongoose.model<IUserPreferencesDoc>(
        DbModels.USER_PREFERENCES,
        UserPreferencesSchema,
    );

export default UserPreferences;
