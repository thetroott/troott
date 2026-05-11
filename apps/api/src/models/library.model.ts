import mongoose, { Schema, Model } from 'mongoose';
import type ILibraryDoc from '@/interfaces/library.interface';
import { LibraryItemType, LibraryItemAddedFrom } from '@/interfaces/library.interface';
import { DbModels } from '@/types/common.enum';

const LibrarySchema = new Schema<ILibraryDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },
        slug: { type: String, unique: true, sparse: true },

        listener: {
            type: Schema.Types.ObjectId,
            ref: DbModels.LISTENER,
            required: true,
            index: true,
        },

        items: [
            {
                id: { type: String },
                type: {
                    type: String,
                    enum: Object.values(LibraryItemType),
                    required: true,
                },
                sermon: { type: Schema.Types.ObjectId, ref: DbModels.SERMON },
                playlist: { type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST },
                series: { type: Schema.Types.ObjectId, ref: DbModels.SERIES },
                minister: { type: Schema.Types.ObjectId, ref: DbModels.MINISTER },
                addedAt: { type: String },
                addedFrom: {
                    type: String,
                    enum: Object.values(LibraryItemAddedFrom),
                },
                sortOrder: { type: Number },
                flags: {
                    liked: { type: Boolean, default: false },
                    downloaded: { type: Boolean, default: false },
                    pinned: { type: Boolean, default: false },
                    favourite: { type: Boolean, default: false },
                },
            },
        ],

        sermonCount: { type: Number, default: 0 },
        playlistCount: { type: Number, default: 0 },
        seriesCount: { type: Number, default: 0 },
        ministerCount: { type: Number, default: 0 },

        lastSyncedAt: { type: String },
        syncVersion: { type: Number, default: 0 },

        createdBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
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

const Library: Model<ILibraryDoc> = mongoose.model<ILibraryDoc>(
    DbModels.LIBRARY,
    LibrarySchema,
);

export default Library;
