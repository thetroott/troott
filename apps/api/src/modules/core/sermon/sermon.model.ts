import mongoose, { Schema, Model } from 'mongoose';
import type { ISermonDoc } from './sermon.interface';
import {
    DbModels,
    ContentState,
    ContentStatus,
    ProcessingState,
    UploadStepType,
} from '../../../utils/enums.util';

const SermonSchema = new Schema<ISermonDoc>(
    {
        title: { type: String },
        description: { type: String, maxLength: 1000 },
        duration: { type: Number }, // In sConds
        releaseDate: { type: Date },
        releaseYear: { type: Number },
        sermonUrl: { type: String },
        imageUrl: { type: String },
        size: { type: Number },

        topic: { type: String },
        slug: {
            type: String,
            trim: true,
            sparse: true,
            unique: true,
            index: true,
        },
        tags: [{ type: String }],
        isPublic: { type: Boolean, default: true, index: true },
        shareableUrl: { type: String },

        isSeries: { type: Boolean, default: false },
        series: [
            {
                type: Schema.Types.ObjectId,
                ref: DbModels.SERIES,
                default: null,
                index: true,
            },
        ],

        totalPlay: [
            {
                userId: { type: Schema.Types.ObjectId, ref: DbModels.USER },
                playedAt: { type: Date },
            },
        ],
        totalLikes: [
            {
                userId: { type: Schema.Types.ObjectId, ref: DbModels.USER },
                likedAt: { type: Date },
            },
        ],
        totalShares: [
            {
                userId: { type: Schema.Types.ObjectId, ref: DbModels.USER },
                shareAt: { type: Date },
            },
        ],
        state: {
            type: String,
            enum: Object.values(ContentState),
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(ContentStatus),
            index: true,
        },
        uploadState: {
            type: String,
            enum: Object.values(UploadStepType),
            index: true,
        },

        //upload data
        uploadSummary: {
            fileId: { type: String },
            fileName: { type: String },
            fileSize: { type: Number },
            fileType: { type: String }, // or enum
            mimetype: { type: String },
            metadata: { type: Schema.Types.Mixed },
            uploadedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
            uploadStatus: { type: String },
            uploadId: { type: String },
            s3Key: { type: String },
            rawFile: { type: String },
        },

        imageSummary: {
            fileName: { type: String },
            fileSize: { type: Number },
            fileType: { type: String }, // or enum
            mimetype: { type: String },
            metadata: { type: Schema.Types.Mixed },
            uploadedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
            uploadStatus: { type: String },
            uploadId: { type: String },
            s3Key: { type: String },
            rawFile: { type: String },
        },

        // Modifications
        versionId: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SERMON,
            default: null,
        },

        changesSummary: { type: String },

        // Relationships
        minister: {
            type: Schema.Types.ObjectId,
            ref: DbModels.MINISTER,
            index: true,
        },

        playlist: { type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST },
        publishedBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                if ('__v' in ret) delete (ret as any).__v;
            },
        },
    },
);

SermonSchema.index({ title: 'text', description: 'text' });

const Sermon: Model<ISermonDoc> = mongoose.model<ISermonDoc>(
    DbModels.SERMON,
    SermonSchema,
);

export default Sermon;
