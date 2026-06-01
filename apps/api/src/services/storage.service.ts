import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    S3Client,
} from '@aws-sdk/client-s3';
import type { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../configs/aws.config';
import {
    bucketNameFor,
    inferBucketRoleFromKey,
    type S3BucketRole,
} from '../configs/s3-buckets.config';
import { IFile, IResult } from '@/interfaces/common.interface';

import { Upload } from '@aws-sdk/lib-storage';
import { UploadStatus } from '@/types/upload.enums';
import { getS3Folder } from '../utils/helpers.util';

class StorageService {
    private s3Client: S3Client = s3;
    private readonly URL_EXPIRATION = 3600;

    private bucketFor(role?: S3BucketRole, key?: string): string {
        if (role) {
            return bucketNameFor(role);
        }
        if (key) {
            return bucketNameFor(inferBucketRoleFromKey(key));
        }
        return bucketNameFor('storage');
    }

    /**
     * Upload a stream to an explicit bucket role and key (no MIME folder prefix).
     * Used for HLS segments on troott-playback.
     */
    public async putStreamAtKey(data: {
        role: S3BucketRole;
        key: string;
        stream: NodeJS.ReadableStream;
        mimeType: string;
        size: number;
        fileType?: IFile['fileType'];
    }): Promise<IResult> {
        const { role, key, stream, mimeType, size, fileType } = data;
        const bucket = bucketNameFor(role);
        const body = stream as unknown as Readable;

        try {
            const s3Upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: bucket,
                    Key: key,
                    Body: body,
                    ContentType: mimeType,
                },
            });

            const s3Response = await s3Upload.done();

            return {
                error: false,
                code: 200,
                message: 'File uploaded successfully.',
                data: {
                    fileName: key.split('/').pop(),
                    fileSize: size,
                    fileType: fileType ?? 'audio',
                    mimetype: mimeType,
                    uploadStatus: UploadStatus.COMPLETED,
                    uploadId: key,
                    s3Key: key,
                    rawFile: s3Response.Location,
                    bucket,
                },
            };
        } catch (err: any) {
            body.destroy?.();
            return {
                error: true,
                code: 500,
                message: err.message,
                data: {},
            };
        }
    }

    /**
     * @method uploadFile
     * @description Uploads a file stream to S3 and returns the upload result.
     * Validates required fields, determines the appropriate S3 folder based on the MIME type,
     * and handles both success and failure cases. If the upload fails, it cleans up any
     * partially uploaded file.
     *
     * @param {IFile} data - The file upload payload.
     * @param {NodeJS.ReadableStream} data.stream - The file stream to be uploaded.
     * @param {string} data.mimeType - The MIME type of the file (e.g. "image/png").
     * @param {string} data.uploadId - Unique identifier for this upload.
     * @param {{ filename: string }} data.info - File metadata including filename.
     * @param {number} data.size - The size of the file in bytes.
     * @param {string} data.fileType - The file type category (e.g. image, audio, video, document).
     *
     * @returns {Promise<IResult>} A structured result object containing:
     * - {boolean} error - Whether the upload failed.
     * - {string} message - Human-readable description of the result.
     * - {number} code - HTTP-style status code.
     * - {object} data - Metadata about the uploaded file (fileName, fileSize, fileType, mimetype, uploadStatus, uploadId, s3Key, rawFile).
     *
     * @throws {Error} If S3 upload fails or a required field is missing.
     */
    public async uploadFile(data: IFile): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { stream, mimeType, uploadId, info, size, fileType } = data;

        if (!stream || !info || !mimeType || !fileType) {
            result.error = true;
            result.code = 400;
            result.message = 'Missing required upload fields.';
            return result;
        }

        const folder = await getS3Folder(mimeType);
        const s3Key = `${folder}/${uploadId}`;

        try {
            const s3Upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: bucketNameFor('storage'),
                    Key: s3Key,
                    Body: stream,
                    ContentType: mimeType,
                },
            });

            const s3Response = await s3Upload.done();

            return {
                error: false,
                code: 200,
                message: 'File uploaded successfully.',
                data: {
                    fileName: info.filename,
                    fileSize: size,
                    fileType,
                    mimetype: mimeType,
                    uploadStatus: UploadStatus.COMPLETED,
                    uploadId,
                    s3Key: s3Key,
                    rawFile: s3Response.Location,
                },
            };
        } catch (err: any) {
            console.error('upload failed with a specific error:', err);
            stream.destroy();

            await this.deleteFile(uploadId as string);
            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    /**
     * @method exists
     * @description Checks if a file exists in the configured S3 bucket.
     * Returns `data.exists = true` if file exists, `false` if not.
     * Handles errors and returns consistent IResult.
     *
     * @param {string} key - The key (path) of the file in S3.
     * @returns {Promise<IResult>} Result object containing:
     * - error: boolean, true if an error occurred
     * - message: string, description of the result
     * - code: number, HTTP-style code
     * - data: object with `exists` property (true/false)
     */
    public async exists(key: string, role?: S3BucketRole): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const bucket = this.bucketFor(role, key);

        try {
            await this.s3Client.send(
                new HeadObjectCommand({ Bucket: bucket, Key: key }),
            );

            result = {
                error: false,
                message: 'File exists',
                code: 200,
                data: { exists: true },
            };
        } catch (err: any) {
            if (err.name === 'NotFound') {
                result = {
                    error: false,
                    message: 'File does not exist',
                    code: 404,
                    data: { exists: false },
                };
            }
            result = {
                error: true,
                message: err.message,
                code: 500,
                data: {},
            };
        }

        return result;
    }

    /**
     * @method getSignedUrl
     * @description Generates a pre-signed URL for a file in S3.
     * URL expires after `URL_EXPIRATION` seconds (default 3600s / 1 hour).
     *
     * @param {string} key - The key (path) of the file in S3.
     * @returns {Promise<IResult>} Result object containing:
     * - error: boolean, true if an error occurred
     * - message: string, description of the result
     * - code: number, HTTP-style code
     * - data: object containing `url` property with the signed URL
     */
    public async getSignedUrl(key: string, role?: S3BucketRole): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const bucket = this.bucketFor(role, key);
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const url = await getSignedUrl(this.s3Client, command, {
                expiresIn: this.URL_EXPIRATION,
            });

            result = {
                error: false,
                message: 'URL generated successfully',
                code: 200,
                data: { url },
            };
        } catch (error: any) {
            result = {
                error: true,
                message: error.message,
                code: 500,
                data: {},
            };
        }
        return result;
    }

    /**
     * Download the full contents of an S3 object as a Buffer.
     * Useful when you need the entire file in memory (e.g. PDF generation,
     * email attachments). For large files prefer {@link getObjectStream}.
     */
    public async getDocument(key: string, role?: S3BucketRole): Promise<IResult> {
        const bucket = this.bucketFor(role, key);
        try {
            const out = await this.s3Client.send(
                new GetObjectCommand({ Bucket: bucket, Key: key }),
            );

            if (!out.Body) {
                return {
                    error: true,
                    message: 'Empty S3 body',
                    code: 500,
                    data: {},
                };
            }

            const chunks: Buffer[] = [];
            for await (const chunk of out.Body as AsyncIterable<Uint8Array>) {
                chunks.push(Buffer.from(chunk));
            }

            return {
                error: false,
                message: 'Document retrieved successfully',
                code: 200,
                data: {
                    buffer: Buffer.concat(chunks),
                    contentType: out.ContentType,
                },
            };
        } catch (error: any) {
            if (
                error.name === 'NoSuchKey' ||
                error.$metadata?.httpStatusCode === 404
            ) {
                return {
                    error: true,
                    message: 'Document not found',
                    code: 404,
                    data: {},
                };
            }
            return { error: true, message: error.message, code: 500, data: {} };
        }
    }

    /**
     * Generate a presigned GET URL for an arbitrary bucket and key.
     * Falls back to 30 minutes if no duration is provided.
     */
    public async generatePresignedUrl(
        bucket: string,
        key: string,
        durationSeconds?: number,
    ): Promise<IResult> {
        const expiry = durationSeconds ?? 1800;
        try {
            const command = new GetObjectCommand({ Bucket: bucket, Key: key });
            const url = await getSignedUrl(this.s3Client, command, {
                expiresIn: expiry,
            });

            return {
                error: false,
                message: 'Presigned URL generated successfully',
                code: 200,
                data: { url, expiresIn: expiry },
            };
        } catch (error: any) {
            return { error: true, message: error.message, code: 500, data: {} };
        }
    }

    /**
     * Stream an object from S3 (for workers reading originals before transcoding).
     */
    public async getObjectStream(
        key: string,
        role: S3BucketRole = 'originals',
    ): Promise<IResult & { stream?: Readable }> {
        let result: IResult & { stream?: Readable } = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const bucket = this.bucketFor(role, key);
        try {
            const out = await this.s3Client.send(
                new GetObjectCommand({
                    Bucket: bucket,
                    Key: key,
                }),
            );
            if (!out.Body || !(out.Body as Readable).read) {
                result = {
                    error: true,
                    message: 'Empty S3 body',
                    code: 500,
                    data: {},
                };
                return result;
            }
            result.data = { key };
            result.stream = out.Body as Readable;
            return result;
        } catch (error: any) {
            return {
                error: true,
                message: error.message,
                code: 500,
                data: {},
            };
        }
    }

    /**
     * Delete all objects under a prefix (best-effort cleanup after failed transcode).
     */
    public async deleteObjectsByPrefix(
        prefix: string,
        role: S3BucketRole = 'playback',
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const bucket = this.bucketFor(role, prefix);
        try {
            const keys: string[] = [];
            let token: string | undefined;
            do {
                const list = await this.s3Client.send(
                    new ListObjectsV2Command({
                        Bucket: bucket,
                        Prefix: prefix,
                        ContinuationToken: token,
                    }),
                );
                for (const o of list.Contents ?? []) {
                    if (o.Key) keys.push(o.Key);
                }
                token = list.IsTruncated
                    ? list.NextContinuationToken
                    : undefined;
            } while (token);

            while (keys.length) {
                const batch = keys.splice(0, 1000);
                await this.s3Client.send(
                    new DeleteObjectsCommand({
                        Bucket: bucket,
                        Delete: {
                            Objects: batch.map((Key) => ({ Key })),
                            Quiet: true,
                        },
                    }),
                );
            }
            result.message = `Deleted prefix ${prefix}`;
            return result;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
            return result;
        }
    }

    /**
     * @method deleteFile
     * @description Deletes a file from the configured S3 bucket.
     * Returns a standard IResult object for success or error.
     *
     * @param {string} key - The key (path) of the file in S3.
     * @returns {Promise<IResult>} Result object containing:
     * - error: boolean, true if an error occurred
     * - message: string, description of the result
     * - code: number, HTTP-style code
     * - data: empty object
     */
    public async deleteFile(key: string, role?: S3BucketRole): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const bucket = this.bucketFor(role, key);

        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
                }),
            );

            result = {
                error: false,
                message: 'File deleted successfully',
                code: 200,
                data: {},
            };
        } catch (error: any) {
            result = {
                error: true,
                message: error.message,
                code: 500,
                data: {},
            };
        }
        return result;
    }
}

export default new StorageService();
