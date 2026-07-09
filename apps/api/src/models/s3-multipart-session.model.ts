import mongoose, { Model, Schema } from 'mongoose';
import type { IS3MultipartSessionDoc } from '@/interfaces/s3-multipart-session.interface';
import { S3_MULTIPART_SESSION_EXPIRY_HOURS } from '@/configs/s3-multipart.config';

const S3MultipartSessionSchema = new Schema<IS3MultipartSessionDoc>(
    {
        sessionId: { type: String, required: true, unique: true, index: true },
        uploadId: { type: String, required: true, index: true },
        s3UploadId: { type: String, required: true },
        s3Key: { type: String, required: true },
        bucket: { type: String, required: true },
        ownerId: { type: String, required: true, index: true },
        purpose: {
            type: String,
            required: true,
            enum: ['sermon-audio', 'storage-image', 'storage-document'],
        },
        contentType: { type: String, required: true },
        contentLength: { type: Number, required: true },
        filename: { type: String },
        fileType: { type: String, required: true },
        finalized: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['pending', 'uploading', 'completed', 'aborted'],
            default: 'pending',
        },
        sermonId: { type: String },
        storageComplete: { type: Boolean, default: false },
    },
    { timestamps: true },
);

S3MultipartSessionSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: S3_MULTIPART_SESSION_EXPIRY_HOURS * 3600 },
);

const S3MultipartSession: Model<IS3MultipartSessionDoc> =
    mongoose.models.S3MultipartSession ||
    mongoose.model<IS3MultipartSessionDoc>(
        'S3MultipartSession',
        S3MultipartSessionSchema,
    );

export default S3MultipartSession;
