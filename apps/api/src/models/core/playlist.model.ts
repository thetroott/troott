import mongoose, { Schema, Model } from 'mongoose';
import type IPlaylistDoc from '@/interfaces/core/playlist.interface';
import {
    PlaylistType,
    PlaylistOwnerType,
    PlaylistVisibility,
    PlaylistStatus,
} from '@/interfaces/core/playlist.interface';
import { DbModels } from '@/types/common.enum';

const PlaylistSchema = new Schema<IPlaylistDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },
        slug: { type: String, unique: true, sparse: true },

        title: { type: String, required: true, index: true },
        description: { type: String, maxLength: 1000 },
        banner: { type: String },

        items: [
            {
                item: { type: Schema.Types.ObjectId, required: true },
                position: { type: Number },
                addedAt: { type: String },
                addedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
            },
        ],
        itemsCount: { type: Number, default: 0 },
        totalDurationMs: { type: Number, default: 0 },

        status: {
            type: String,
            enum: Object.values(PlaylistStatus),
            default: PlaylistStatus.ACTIVE,
            index: true,
        },
        visibility: {
            type: String,
            enum: Object.values(PlaylistVisibility),
            default: PlaylistVisibility.PUBLIC,
            index: true,
        },
        playlistType: {
            type: String,
            enum: Object.values(PlaylistType),
            required: true,
            index: true,
        },

        ownerType: {
            type: String,
            enum: Object.values(PlaylistOwnerType),
            index: true,
        },
        owner: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        listener: { type: Schema.Types.ObjectId, ref: DbModels.LISTENER },
        minister: { type: Schema.Types.ObjectId, ref: DbModels.MINISTER },

        isCollaborative: { type: Boolean, default: false, index: true },
        collaborators: [{ type: Schema.Types.ObjectId, ref: DbModels.USER }],

        likesCount: { type: Number, default: 0 },
        savesCount: { type: Number, default: 0 },
        followersCount: { type: Number, default: 0 },
        sharesCount: { type: Number, default: 0 },
        playsCount: { type: Number, default: 0 },

        isPublic: { type: Boolean, default: true, index: true },
        isFeatured: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },

        tags: [{ type: String }],
        genres: [{ type: String }],
        languages: [{ type: String }],

        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc: any, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

PlaylistSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Playlist: Model<IPlaylistDoc> = mongoose.model<IPlaylistDoc>(
    DbModels.PLAYLIST,
    PlaylistSchema,
);

export default Playlist;
