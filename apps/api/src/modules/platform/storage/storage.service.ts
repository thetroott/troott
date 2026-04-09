import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, AWS_BUCKET_NAME } from '../../../configs/aws.config';
import { IFile, IResult } from '../../../utils/interfaces.util';

import { Upload } from '@aws-sdk/lib-storage';
import { UploadStatus } from '../../../utils/enums.util';
import { getS3Folder } from '../../../utils/helpers.util';

class StorageService {
    private s3Client: S3Client = s3;
    private bucket = AWS_BUCKET_NAME;
    private readonly URL_EXPIRATION = 3600;

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
                    Bucket: this.bucket,
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
    public async exists(key: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            await this.s3Client.send(
                new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
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
    public async getSignedUrl(key: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
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
    public async deleteFile(key: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
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
