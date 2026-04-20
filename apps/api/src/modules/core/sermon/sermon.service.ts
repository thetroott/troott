import { IFile, IResult } from '../../../utils/interfaces.util';
import type { IAudioMetadataJobDTO, ISermonDoc } from './sermon.interface';
import StorageService from '../../platform/storage/storage.service';
import {
    UploadStatus,
    S3Folder,
    ContentStatus,
    UploadStepType,
} from '../../../utils/enums.util';
import { PublishSermonDTO } from './sermon.dto';
import { Upload } from '@aws-sdk/lib-storage';
import sermonRepository from './sermon.repository';
import Sermon from './sermon.model';
import { AWS_BUCKET_NAME, s3 } from '../../../configs/aws.config';
import { addJob } from '../../../tasks/jobs/job';
import { JobChannel, QueueChannel } from '../../../queues/channel.queue';

class SermonService {
    private s3Client = s3;
    private readonly bucket = AWS_BUCKET_NAME;
    private readonly UPLOAD_EXPIRY = 1000 * 60 * 60 * 24;
    private readonly storageService = StorageService;

    /**
     * @method handleSermonUpload
     * @description
     * Handles the streaming upload of a sermon file to S3, extracts metadata,
     * and saves the upload session to the database as a draft sermon record.
     * Ensures proper error handling and cleanup of streams on failure.
     *
     * Validates required fields in the `data` object before uploading.
     * On success, returns the database record summary; on failure, cleans up S3 and streams.
     *
     * @param {IFile} data - Object containing all necessary information for the upload:
     * @param {stream.Readable} data.stream - The main file stream to upload to S3.
     * @param {stream.Readable} data.metadataStream - Stream for metadata extraction.
     * @param {Object} data.info - File info (e.g., filename).
     * @param {string} data.mimeType - MIME type of the file.
     * @param {number} data.size - Size of the file in bytes.
     * @param {string} data.fileType - Type of the file (e.g., audio, video).
     * @param {string} data.uploadId - Unique ID for this upload session / S3 key.
     * @param {string} [data.uploadedBy] - Optional user ID of the uploader.
     *
     * @returns {Promise<IResult>} - Standard result object with:
     * - error: boolean, true if an error occurred.
     * - message: string, description of the operation result.
     * - code: number, HTTP-style status code (200, 400, 500).
     * - data: object containing the uploaded sermon record on success, empty on failure.
     *
     * @throws Will not throw directly; all errors are caught and returned in IResult.
     */
    public async handleUploadSermon(data: IFile): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const {
            stream,
            metadataStream,
            info,
            mimeType,
            size,
            fileType,
            uploadId,
        } = data;

        if (!stream || !metadataStream || !info || !mimeType || !fileType) {
            result.error = true;
            result.code = 400;
            result.message = 'Missing required upload fields.';
            return result;
        }

        const folder = await this.getS3Folder(mimeType);
        const s3Key = `${folder}/${uploadId}`;

        try {
            // Upload to S3
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

            // Prepare the upload summary for Sermon model
            const uploadSummary = {
                fileId: uploadId,
                fileName: info.filename,
                fileSize: size,
                fileType,
                mimetype: mimeType,
                uploadedBy: data.uploadedBy,
                uploadStatus: UploadStatus.COMPLETED,
                uploadId,
                s3Key: s3Key,
                rawFile: s3Response.Location,
            };

            // Save upload session in DB
            const SermonUpload: Partial<ISermonDoc> = await Sermon.create({
                uploadSummary,
                status: ContentStatus.PROCESSING,
                uploadState: UploadStepType.AUDIO_METADATA_PROCESSING,
            });

            //enqueue the audio-metadata processing
            const audioJobData: IAudioMetadataJobDTO = {
                streamForMetadata: metadataStream,
                mimeType: mimeType,
                uploadId: uploadId as string,
            };

            addJob({
                queueName: JobChannel.extractAudioMetadata,
                jobName: QueueChannel.AudioMetadata,
                data: audioJobData,
                options: {
                    jobId: `audio-meta-${uploadId}`,
                },
            });

            result.message = 'Sermon uploaded successfully';
            result.data = SermonUpload;

            return result;
        } catch (err: any) {
            console.error('Sermon upload failed with a specific error:', err);

            stream.destroy();
            metadataStream.destroy();

            // Cleanup S3 file on failure
            await this.storageService.deleteFile(uploadId as string);

            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    /**
     * @name handleUploadImage
     * @description Streams and uploads an image file to S3, saves upload metadata in the database,
     *              and returns a structured result.
     * @param {IFile} data - The file object containing streams, metadata, mimeType, and upload details.
     * @returns {Promise<IResult>} A structured result containing the upload session or error details.
     */
    public async handleUploadImage(data: IFile): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: null,
        };

        const {
            stream,
            metadataStream,
            info,
            mimeType,
            size,
            fileType,
            uploadId,
        } = data;

        if (!stream || !metadataStream || !info || !mimeType || !fileType) {
            result.error = true;
            result.code = 400;
            result.message = 'Missing required upload fields.';
            return result;
        }

        const folder = await this.getS3Folder(mimeType);
        const s3Key = `${folder}/${uploadId}`;

        try {
            // Upload to S3
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

            // Prepare the image for Sermon model
            const uploadImage = {
                fileName: info.filename,
                fileSize: size,
                fileType,
                mimetype: mimeType,
                uploadedBy: data.uploadedBy,
                uploadStatus: UploadStatus.COMPLETED,
                uploadId,
                s3Key: s3Key,
                rawFile: s3Response.Location,
            };

            // Save upload session in DB
            const uploadResult: Partial<ISermonDoc> = await Sermon.create({
                imageSummary: uploadImage,
                status: ContentStatus.DRAFT,
                uploadState: UploadStepType.IMAGE_UPLOADING,
            });

            result.message = 'Image uploaded successfully';
            result.data = uploadResult;

            return result;
        } catch (err: any) {
            stream.destroy();
            metadataStream.destroy();

            await this.storageService.deleteFile(s3Key);

            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    /**
     * @name handlePublishSermon
     * @description Publishes a sermon by updating its details (title, description, tags, etc.)
     *              using the provided DTO. Finds the sermon by its audio upload ID.
     * @param {PublishSermonDTO} data - The DTO containing sermon details to publish.
     * @returns {Promise<IResult>} A structured result containing the published sermon or error details.
     */
    public async handlePublishSermon(data: PublishSermonDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const {
                title,
                description,
                duration,
                sermon,
                image,
                size,
                releaseDate,
                releaseYear,
                topic,
                tags,
                isPublic,
                isSeries,
                publishedBy,
            } = data;

            // i want to use the audio upload id to find the sermon id

            const findSermon = await sermonRepository.findByUploadId(
                data.sermon,
            );
            if (findSermon.error || !findSermon.data) {
                result.error = true;
                result.message = findSermon.message || 'Sermon not found.';
                result.code = 404;
                return result;
            }

            const sermonId = findSermon.data._id;

            const publishSermon: ISermonDoc | null =
                await Sermon.findByIdAndUpdate(
                    sermonId,
                    {
                        title,
                        description,
                        duration,
                        sermon,
                        image,
                        size,
                        releaseDate,
                        releaseYear,
                        topic,
                        tags,
                        isPublic,
                        isSeries,
                        publishedBy,
                    },
                    { new: true, runValidators: true },
                );

            if (!publishSermon) {
                result.error = true;
                result.message = 'Sermon update failed.';
                result.code = 500;
                return result;
            }

            result.message = 'Sermon published successfully';
            result.data = publishSermon;
            return result;
        } catch (err: any) {
            console.error('Sermon publish failed:', err);
            result.error = true;
            result.code = 500;
            result.message = err.message || 'Failed to publish sermon';
            return result;
        }
    }

    /**
     * @name validateSermonPublish
     * @description Validates the required fields before a sermon can be published.
     * @param {PublishSermonDTO} data - The sermon publish data to validate.
     * @returns {Promise<IResult>} A structured result containing validation success or error messages.
     */
    public async validateSermonPublish(
        data: PublishSermonDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!data.title) {
            result.error = true;
            result.message = 'Title is required';
        } else if (!data.description) {
            result.error = true;
            result.message = 'Description is required';
        } else if (!data.duration) {
            result.error = true;
            result.message = 'Duration is required';
        } else if (!data.releaseDate) {
            result.error = true;
            result.message = 'Release date is required';
        } else if (!data.releaseYear) {
            result.error = true;
            result.message = 'Release year is required';
        } else if (!data.sermon) {
            result.error = true;
            result.message = 'Sermon File is required';
        } else if (!data.image) {
            result.error = true;
            result.message = 'Image File is required';
        } else if (!data.topic) {
            result.error = true;
            result.message = 'topic is required';
        } else if (!data.tags) {
            result.error = true;
            result.message = 'Tags are required';
        } else if (!data.isPublic) {
            result.error = true;
            result.message = 'Visibility is required';
        } else if (!data.isSeries) {
            result.error = true;
            result.message = 'Series status is required';
        } else if (!data.publishedBy) {
            result.error = true;
            result.message = 'Publised by is required';
        } else {
            result.error = false;
            result.message = '';
        }

        return result;
    }

    /**
     * @name getS3Folder
     * @description Determines the correct S3 folder based on the file's MIME type.
     * @param {string} mimeType - The MIME type of the file.
     * @returns {Promise<S3Folder>} The S3 folder enum where the file should be stored.
     */
    private async getS3Folder(mimeType: string): Promise<S3Folder> {
        switch (mimeType) {
            // Images
            case 'image/jpeg':
            case 'image/png':
            case 'image/webp':
            case 'image/svg+xml':
                return S3Folder.IMAGES;

            // Audio
            case 'audio/mpeg':
            case 'audio/mp3':
            case 'audio/wav':
            case 'audio/aac':
            case 'audio/x-m4a':
                return S3Folder.AUDIO;

            // Video
            case 'video/mp4':
            case 'video/webm':
                return S3Folder.VIDEOS;

            // Documents
            case 'application/pdf':
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            case 'text/plain':
                return S3Folder.DOCUMENTS;

            default:
                return S3Folder.OTHERS;
        }
    }

    /**
     * @name attachAppUrl
     * @description Attaches a shareable application URL to a sermon document for external access.
     * @param {ISermonDoc} sermon - The sermon document to update.
     * @param {string} [appUrl] - Optional base application URL. Defaults to CLIENT_APP_URL env variable.
     * @returns {Promise<void>} Resolves when the shareable URL is saved to the sermon.
     * @throws {Error} If the sermon is not found in the repository.
     */
    public async attachAppUrl(
        sermon: ISermonDoc,
        appUrl?: string,
    ): Promise<void> {
        const baseUrl = appUrl || (process.env.CLIENT_APP_URL as string);

        const sermonExist = await sermonRepository.findBySermonId(
            String(sermon._id),
        );
        if (!sermonExist) {
            throw new Error('Sermon not found');
        }

        const base = (baseUrl || '').replace(/\/$/, '');
        const shareableUrl = `${base}/sermon/${sermon._id}`;
        sermon.shareableUrl = shareableUrl;

        await sermon.save();
    }
}

export default new SermonService();

// audio processing
// metadata extraction
// transcoding
// storing different bitrates
// updating sermon document with processed file info
