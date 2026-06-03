import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    S3Client,
} from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import type { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    AWS_BUCKETS_ORIGINALS,
    AWS_BUCKETS_PLAYBACK,
    AWS_BUCKETS_STORAGE,
    s3,
} from '../configs/aws.config';

import { FileType, IFile, IResult } from '@/interfaces/common.interface';

import { Upload } from '@aws-sdk/lib-storage';
import { UploadStatus } from '@/types/upload.enums';
import { getS3Folder, buildStoragePublicUrl, buildS3ObjectKey } from '../utils/helpers.util';

function mimeTypeForHlsFile(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.m3u8') {
        return 'application/vnd.apple.mpegurl';
    }
    if (ext === '.ts') {
        return 'video/mp2t';
    }
    return 'application/octet-stream';
}

async function uploadHlsPackFile(
    storage: StorageService,
    uploadId: string,
    renditionName: string,
    fullPath: string,
    fileName: string,
): Promise<unknown> {
    const st = await fs.stat(fullPath);
    if (!st.isFile() || st.size === 0) {
        return null;
    }
    const stream = createReadStream(fullPath);
    const objectKey = `${uploadId}/hls/${renditionName}/${fileName}`;
    const uploadResult = await storage.putStreamAtKey({
        key: objectKey,
        stream,
        mimeType: mimeTypeForHlsFile(fileName),
        size: st.size,
        fileType: FileType.AUDIO,
    });
    if (uploadResult.error) {
        throw new Error(uploadResult.message || 'S3 upload failed');
    }
    await fs.unlink(fullPath);
    return uploadResult.data;
}

/** Polls pack dirs during encode; uploads closed segments and unlinks local files. */
export class HlsIncrementalUploader {
    private readonly uploaded = new Set<string>();
    private readonly uploadedArtifacts: unknown[] = [];
    private timer: ReturnType<typeof setInterval> | undefined;
    private running = false;

    constructor(
        private readonly storage: StorageService,
        private readonly uploadId: string,
        private readonly renditionNames: string[],
        private readonly packRoot: string,
    ) {}

    start(pollMs = 400): void {
        if (this.timer) {
            return;
        }
        this.timer = setInterval(() => {
            void this.tick().catch(() => {
                /* logged by caller on encode failure */
            });
        }, pollMs);
    }

    stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    async tick(): Promise<void> {
        if (this.running) {
            return;
        }
        this.running = true;
        try {
            for (const name of this.renditionNames) {
                const dir = path.join(this.packRoot, name);
                let files: string[];
                try {
                    files = await fs.readdir(dir);
                } catch {
                    continue;
                }
                for (const file of files) {
                    if (!file.endsWith('.ts')) {
                        continue;
                    }
                    const fullPath = path.join(dir, file);
                    if (this.uploaded.has(fullPath)) {
                        continue;
                    }
                    try {
                        const st1 = await fs.stat(fullPath);
                        if (!st1.isFile() || st1.size === 0) {
                            continue;
                        }
                        await new Promise((r) => setTimeout(r, 80));
                        const st2 = await fs.stat(fullPath);
                        if (st2.size !== st1.size) {
                            continue;
                        }
                        const data = await uploadHlsPackFile(
                            this.storage,
                            this.uploadId,
                            name,
                            fullPath,
                            file,
                        );
                        if (data != null) {
                            this.uploaded.add(fullPath);
                            this.uploadedArtifacts.push(data);
                        }
                    } catch {
                        /* segment still being written */
                    }
                }
            }
        } finally {
            this.running = false;
        }
    }

    async flushRemaining(): Promise<unknown[]> {
        this.stop();
        await this.tick();
        for (const name of this.renditionNames) {
            const dir = path.join(this.packRoot, name);
            let files: string[];
            try {
                files = await fs.readdir(dir);
            } catch {
                continue;
            }
            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (this.uploaded.has(fullPath)) {
                    continue;
                }
                try {
                    const data = await uploadHlsPackFile(
                        this.storage,
                        this.uploadId,
                        name,
                        fullPath,
                        file,
                    );
                    if (data != null) {
                        this.uploaded.add(fullPath);
                        this.uploadedArtifacts.push(data);
                    }
                } catch {
                    // ignore
                }
            }
            try {
                await fs.rmdir(dir);
            } catch {
                // ignore
            }
        }
        return this.uploadedArtifacts;
    }
}

class StorageService {
    private s3Client: S3Client = s3;
    private readonly URL_EXPIRATION = 3600;

    /** HLS segments and manifests — `AWS_BUCKETS_PLAYBACK` from `aws.config.ts`. */
    public async putStreamAtKey(data: {
        key: string;
        stream: NodeJS.ReadableStream;
        mimeType: string;
        size: number;
        fileType?: IFile['fileType'];
    }): Promise<IResult> {
        
        const { key, stream, mimeType, size, fileType } = data;
        const body = stream as unknown as Readable;

        try {
            const s3Upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: AWS_BUCKETS_PLAYBACK,
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
                    bucket: AWS_BUCKETS_PLAYBACK,
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
     * Upload multipart file to any S3 bucket using `{folder}/{uploadId}.{ext}` keys.
     * Used by storage stills, sermon originals (audio), sermon covers, profile uploads, etc.
     */
    public async uploadFileToBucket(
        data: IFile,
        bucket: string,
        options?: {
            /** Return raw S3 Location (sermon originals). Default: CDN URL for storage bucket. */
            useS3Location?: boolean;
            publicUrl?: (s3Key: string) => string;
        },
    ): Promise<IResult> {
        const { stream, mimeType, uploadId, info, size, fileType } = data;

        if (!stream || !info || !mimeType || !fileType || !uploadId) {
            return {
                error: true,
                code: 400,
                message: 'Missing required upload fields.',
                data: {},
            };
        }

        const folder = getS3Folder(mimeType);
        const s3Key = buildS3ObjectKey(
            folder,
            String(uploadId),
            mimeType,
            info.filename ?? data.fileName,
        );

        try {
            const s3Upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: bucket,
                    Key: s3Key,
                    Body: stream,
                    ContentType: mimeType,
                },
            });

            const s3Response = await s3Upload.done();
            const resolvePublicUrl = options?.publicUrl ?? buildStoragePublicUrl;
            const rawFile = options?.useS3Location
                ? String(s3Response.Location ?? '')
                : resolvePublicUrl(s3Key);

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
                    s3Key,
                    rawFile,
                    bucket,
                },
            };
        } catch (err: unknown) {
            stream.destroy?.();
            await this.deleteFile(s3Key, bucket);
            const message =
                err instanceof Error ? err.message : 'Upload failed';
            return {
                error: true,
                code: 500,
                message,
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
        return this.uploadFileToBucket(data, AWS_BUCKETS_STORAGE, {
            publicUrl: buildStoragePublicUrl,
        });
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
    public async exists(key: string, bucket: string): Promise<IResult> {
        try {
            await this.s3Client.send(
                new HeadObjectCommand({ Bucket: bucket, Key: key }),
            );

            return {
                error: false,
                message: 'File exists',
                code: 200,
                data: { exists: true },
            };
            
        } catch (err: any) {
            if (
                err.name === 'NotFound' ||
                err.$metadata?.httpStatusCode === 404
            ) {
                return {
                    error: false,
                    message: 'File does not exist',
                    code: 404,
                    data: { exists: false },
                };
            }
            return {
                error: true,
                message: err.message,
                code: 500,
                data: {},
            };
        }
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
    public async getSignedUrl(key: string, bucket: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
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
    public async getDocument(key: string, bucket: string): Promise<IResult> {
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
     * Stream source audio from `AWS_BUCKETS_ORIGINALS` (pre-transcode workers).
     */
    public async getObjectStream(
        key: string,
    ): Promise<IResult & { stream?: Readable }> {
        let result: IResult & { stream?: Readable } = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        try {
            const out = await this.s3Client.send(
                new GetObjectCommand({
                    Bucket: AWS_BUCKETS_ORIGINALS,
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
            result.data = {
                key,
                contentLength: out.ContentLength,
            };
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
    public async deleteObjectsByPrefix(prefix: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        try {
            const keys: string[] = [];
            let token: string | undefined;
            do {
                const list = await this.s3Client.send(
                    new ListObjectsV2Command({
                        Bucket: AWS_BUCKETS_PLAYBACK,
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
                        Bucket: AWS_BUCKETS_PLAYBACK,
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
    public async deleteFile(key: string, bucket: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

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

    /** Incremental HLS segment uploader for the audio processing job. */
    public createHlsIncrementalUploader(
        uploadId: string,
        renditionNames: string[],
        packRoot: string,
    ): HlsIncrementalUploader {
        return new HlsIncrementalUploader(
            this,
            uploadId,
            renditionNames,
            packRoot,
        );
    }

    /** Public HTTPS URL for a playback object via CloudFront (`CLOUDFRONT_PLAYBACK_URL`). */
    public urlForPlaybackKey(s3Key: string): string {
        const playbackUrl = (process.env.CLOUDFRONT_PLAYBACK_URL || '').trim();
        if (!playbackUrl) {
            throw new Error('CLOUDFRONT_PLAYBACK_URL is required');
        }

        const parts = s3Key.split('/').filter(Boolean);
        if (parts.length === 0) {
            throw new Error('Playback S3 key is required');
        }

        const [uploadId, ...rest] = parts;
        if (!uploadId) {
            throw new Error('Playback S3 key must include an upload id');
        }

        const playbackCdn = playbackUrl.replace(/\/$/, '');
        const base = `${playbackCdn}/sermon/${encodeURIComponent(uploadId)}`;
        if (rest.length === 0) {
            return base;
        }

        return `${base}/${rest.map(encodeURIComponent).join('/')}`;
    }
}

export default new StorageService();
