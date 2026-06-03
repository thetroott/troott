import mongoose, { Schema, Model } from 'mongoose';
import type ISermonDoc from '@/interfaces/core/sermon.interface';
import {
    MediaStatus,
    SermonVisibilityStatus,
    StreamingProtocol,
    StreamingQuality,
    TokenType,
    UploadStatus,
} from '@/interfaces/core/sermon.interface';
import { DbModels } from '@/types/common.enum';

const SermonSchema = new Schema<ISermonDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },
        slug: {
            type: String,
            trim: true,
            sparse: true,
            unique: true,
            index: true,
        },
        title: { type: String, index: true },
        description: { type: String, maxLength: 1000 },

        playbackUrl: { type: String },
        manifestUrl: { type: String },
        imageUrl: { type: String },

        mimeType: { type: String },
        duration: { type: Number },
        bitrate: { type: Number },
        protocol: {
            type: String,
            enum: Object.values(StreamingProtocol),
        },
        quality: {
            type: String,
            enum: Object.values(StreamingQuality),
        },

        topic: { type: Schema.Types.Mixed },
        tags: [{ type: String }],
        language: { type: String },
        isPublic: { type: Boolean, default: true, index: true },
        visibility: {
            type: String,
            enum: Object.values(SermonVisibilityStatus),
            default: SermonVisibilityStatus.PUBLIC,
            index: true,
        },

        token: { type: String },
        tokenType: {
            type: String,
            enum: Object.values(TokenType),
        },
        signature: { type: String },
        isAuthorized: { type: Boolean, default: false },
        authorizationReason: { type: String },

        series: { type: Schema.Types.ObjectId, ref: DbModels.SERIES, default: null, index: true },
        isSeries: { type: Boolean, default: false },
        minister: [
            {
                type: Schema.Types.ObjectId,
                ref: DbModels.MINISTER,
                index: true,
            },
        ],
        playlist: { type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST },

        preachedAt: { type: String },
        preachedYear: { type: String },
        shareableUrl: { type: String },
        searchText: { type: String },

        allowDownload: { type: Boolean, default: true },
        allowComment: { type: Boolean, default: true },

        item: {
            item: { type: String },
            duration: { type: Number },
            size: { type: Number },
            fileType: { type: String },
            mimetype: { type: String },
            itemId: { type: String, index: true },
            uploadedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
            uploadStatus: {
                type: String,
                enum: Object.values(UploadStatus),
            },
            createdAt: { type: String },
            updatedAt: { type: String },
        },

        image: {
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

        status: {
            type: String,
            enum: Object.values(MediaStatus),
            index: true,
        },
        isPublished: { type: Boolean, default: false },
        publishedAt: { type: Date },
        publishedBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            index: true,
        },

        playCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
        featured: { type: Boolean, default: false },
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

const Sermon: Model<ISermonDoc> = mongoose.model<ISermonDoc>(
    DbModels.SERMON,
    SermonSchema,
);

export default Sermon;
