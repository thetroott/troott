import mongoose, { Schema, Model } from 'mongoose';
import type ISeriesDoc from '@/interfaces/core/series.interface';
import { UploadStatus } from '@/interfaces/core/sermon.interface';
import { DbModels } from '@/types/common.enum';

const SeriesSchema = new Schema<ISeriesDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },
        slug: { type: String, unique: true, sparse: true, index: true },

        title: { type: String, required: true, index: true },
        description: { type: String, default: '', maxLength: 1000 },
        banner: {
            item: { type: String },
            width: { type: Number },
            height: { type: Number },
            size: { type: Number },
            fileType: { type: String },
            mimetype: { type: String },
            itemId: { type: String },
            uploadedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
            uploadStatus: {
                type: String,
                enum: Object.values(UploadStatus),
            },
            createdAt: { type: String },
            updatedAt: { type: String },
        },
        totalDuration: { type: Number, default: 0 },
        numberOfSermons: { type: Number, default: 0 },
        tags: [{ type: String, index: true }],
        language: { type: String },

        ministers: [
            {
                type: Schema.Types.ObjectId,
                ref: DbModels.MINISTER,
                index: true,
            },
        ],
        topic: {
            type: Schema.Types.ObjectId,
            ref: DbModels.TOPIC,
            index: true,
        },

        status: { type: String, index: true },
        isPublic: { type: Boolean, default: true, index: true },
        shareableUrl: { type: String },

        playCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
        featured: { type: Boolean, default: false },

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

SeriesSchema.index({ title: 'text', description: 'text' });

const Series: Model<ISeriesDoc> = mongoose.model<ISeriesDoc>(
    DbModels.SERIES,
    SeriesSchema,
);

export default Series;
