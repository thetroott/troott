import { IFile, IResult } from '@/interfaces/common.interface';
import type { ISermonDoc } from '@/interfaces/core/sermon.interface';
import {
    MediaStatus,
    SermonVisibilityStatus,
    UploadStatus,
} from '@/interfaces/core/sermon.interface';
import { ContentState } from '@/types/common.enum';
import StorageService from '@/services/storage.service';
import { UserType } from '@/interfaces/user.interface';
import {
    PublishSermonDTO,
    PublishSermonInputDTO,
    SermonPipelineDTO,
    IAudioHLSJobDTO,
    IAudioMetadataJobDTO,
} from '@/dtos/core/sermon.dto';
import sermonRepository from '@/repository/core/sermon.repository';
import Sermon from '@/models/core/sermon.model';
import Minister from '@/models/core/minister.model';
import Creator from '@/models/core/creator.model';
import mongoose from 'mongoose';
import {
    AWS_BUCKETS_ORIGINALS,
    AWS_BUCKETS_PLAYBACK,
    AWS_BUCKETS_STORAGE,
} from '@/configs/aws.config';

import { addJob } from '@/tasks/jobs/job';
import { JobChannel, QueueChannel } from '@/queues/channel.queue';
import logger from '@/utils/logger.util';
import BullQueue from '@/queues/queue';
import {
    allowedAudioMimes,
    AudioVariants,
} from '@/utils/audio.util';
import { buildStoragePublicUrl, genSermonCode, genSlug, generateRandomChars } from '@/utils/helpers.util';

const MAX_SERMON_CODE_ATTEMPTS = 10;
const MAX_SERMON_SLUG_ATTEMPTS = 10;

class SermonService {
    private readonly originalsAudioBucket = AWS_BUCKETS_ORIGINALS;
    private readonly playbackBucket = AWS_BUCKETS_PLAYBACK;
    private readonly StorageBucket = AWS_BUCKETS_STORAGE;
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
     * @param {stream.Readable} data.stream - Upload body stream (S3 ingest).
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

        const { stream, info, mimeType, size, fileType, uploadId } = data;

        if (!stream || !info || !mimeType || !fileType) {
            result.error = true;
            result.code = 400;
            result.message = 'Missing required upload fields.';
            return result;
        }

        const mime = mimeType.toLowerCase();

        if (!allowedAudioMimes.has(mime)) {
            result.error = true;
            result.code = 400;
            result.message = 'Unsupported audio format for sermon upload.';
            return result;
        }

        const uploadStarted = Date.now();
        logger.log({
            data: `event=upload-transfer stage=start uploadId=${uploadId} bytes=${size ?? 0} mimeType=${mimeType}`,
            label: 'sermon-upload',
            type: 'info',
        });

        const uploadResult = await this.storageService.uploadFileToBucket(
            data,
            this.originalsAudioBucket,
            { useS3Location: true },
        );

        if (uploadResult.error || !uploadResult.data) {
            result.error = true;
            result.code = uploadResult.code || 500;
            result.message = uploadResult.message || 'Sermon upload failed';
            return result;
        }

        const uploadPayload = uploadResult.data as {
            s3Key: string;
            rawFile: string;
        };
        const s3Key = uploadPayload.s3Key;

        try {
            logger.log({
                data: `event=upload-transfer stage=end uploadId=${uploadId} ms=${Date.now() - uploadStarted} bytes=${size ?? 0} mimeType=${mimeType}`,
                label: 'sermon-upload',
                type: 'info',
            });

            const uploadDate = new Date().toISOString();

            const originalSermonItem = {
                item: uploadPayload.rawFile,
                duration: 0,
                size: size ?? 0,
                fileType,
                mimetype: mimeType,
                itemId: uploadId as string,
                uploadedBy: data.uploadedBy,
                uploadStatus: UploadStatus.UPLOADED,
                createdAt: uploadDate,
                updatedAt: uploadDate,
            };

            const SermonUpload: Partial<ISermonDoc> = await Sermon.create({
                item: originalSermonItem,
                status: MediaStatus.DRAFT,
            });

            const sermonId = String(SermonUpload._id);

            const metaPayload: IAudioMetadataJobDTO = {
                sourceS3Key: s3Key,
                mimeType: mimeType,
                uploadId: uploadId as string,
                sermonId,
            };

            addJob({
                queueName: JobChannel.extractAudioMetadata,
                jobName: QueueChannel.AUDIOMETADATA,
                data: metaPayload,
                options: {
                    jobId: `audio-meta-${uploadId}`,
                    attempts: 5,
                    delay: 0,
                },
            });

            const hlsPayload: IAudioHLSJobDTO = {
                uploadId: uploadId as string,
                sourceS3Key: s3Key,
                mimeType,
                sermonId,
                audioQualities: AudioVariants,
                segmentDuration: 6,
            };

            addJob({
                queueName: JobChannel.processAudio,
                jobName: QueueChannel.AUDIOPROCESSING,
                data: hlsPayload,
                options: {
                    jobId: `audo-processing-hls -${uploadId}`,
                    attempts: 3,
                    delay: 2000,
                },
            });

            logger.log({
                data: `Queued audio-meta + HLS jobs uploadId=${uploadId} s3Key=${s3Key}`,
                label: 'sermon-upload',
                type: 'success',
            });

            result.message = 'Sermon uploaded successfully';
            result.data = SermonUpload;

            return result;
        } catch (err: any) {
            console.error('Sermon upload failed with a specific error:', err);

            await this.storageService.deleteFile(
                s3Key,
                this.originalsAudioBucket,
            );

            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    /**
     * @name handleSermonImage
     * @description Uploads a cover image to S3 and attaches it to an existing sermon.
     * @param {string} sermonId - Sermon document id.
     * @param {IFile} data - The file object containing streams, metadata, mimeType, and upload details.
     * @returns {Promise<IResult>} A structured result containing the updated sermon or error details.
     */
    public async handleSermonImage(
        sermonId: string,
        data: IFile,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: null,
        };

        const { stream, info, mimeType, size, fileType, uploadId } = data;

        if (!stream || !info || !mimeType || !fileType) {
            result.error = true;
            result.code = 400;
            result.message = 'Missing required upload fields.';
            return result;
        }

        const uploadResult = await this.storageService.uploadFileToBucket(
            data,
            this.StorageBucket,
            { useS3Location: true },
        );

        if (uploadResult.error || !uploadResult.data) {
            result.error = true;
            result.code = uploadResult.code || 500;
            result.message = uploadResult.message || 'Sermon image upload failed';
            return result;
        }

        const uploadPayload = uploadResult.data as {
            s3Key: string;
            rawFile: string;
        };
        const s3Key = uploadPayload.s3Key;
        const s3Location = uploadPayload.rawFile;
        const imageUrl = buildStoragePublicUrl(s3Key);

        try {
            const uploadDate = new Date().toISOString();

            const originalImageItem = {
                item: s3Location,
                width: 0,
                height: 0,
                size: size ?? 0,
                fileType,
                mimetype: mimeType,
                itemId: uploadId as string,
                uploadedBy: data.uploadedBy,
                uploadStatus: UploadStatus.COMPLETED,
                createdAt: uploadDate,
                updatedAt: uploadDate,
            };

            const uploadImage = await Sermon.findByIdAndUpdate(
                sermonId,
                {
                    image: originalImageItem,
                    imageUrl,
                    status: MediaStatus.DRAFT,
                },
                { new: true, runValidators: true },
            );

            if (!uploadImage) {
                result.error = true;
                result.code = 404;
                result.message = 'Sermon not found';
                return result;
            }

            result.message = 'Sermon image uploaded successfully';
            result.data = uploadImage;

            return result;
        } catch (err: any) {
            await this.storageService.deleteFile(s3Key, this.StorageBucket);

            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    /**
     * @name buildSermonPipelineDTO
     * @description Pipeline/system fields from the sermon document (upload + processing output).
     */
    public buildSermonPipelineDTO(doc: ISermonDoc): SermonPipelineDTO {
        return {
            item: doc.item,
            image: doc.image,
            imageUrl: doc.imageUrl ?? '',
            playbackUrl: doc.playbackUrl ?? '',
            manifestUrl: doc.manifestUrl ?? '',
            duration: doc.duration ?? 0,
            mimeType: doc.mimeType ?? '',
            protocol: doc.protocol,
            quality: doc.quality,
            bitrate: doc.bitrate ?? 0,
        };
    }

    /**
     * Assigns catalog `code` and `slug` on the publish payload when missing on the doc
     * (same pattern as `genUserCode` / playlist `pl-{random}`).
     */
    public async ensureSermonPublishIdentity(
        payload: PublishSermonDTO,
        doc: ISermonDoc,
    ): Promise<void> {
        if (!payload.code?.trim()) {
            payload.code = doc.code?.trim()
                ? String(doc.code)
                : await this.generateUniqueSermonCode();
        }

        if (!payload.slug?.trim()) {
            payload.slug = doc.slug?.trim()
                ? String(doc.slug)
                : await this.generateUniqueSermonSlug(
                      payload.title?.trim() || 'sermon',
                      payload.code,
                  );
        }
    }

    private async generateUniqueSermonCode(): Promise<string> {
        for (let i = 0; i < MAX_SERMON_CODE_ATTEMPTS; i++) {
            const code = genSermonCode();
            const exists = await Sermon.findOne({ code }).select('_id').lean();
            if (!exists) {
                return code;
            }
        }
        return `sm-${Date.now()}-${generateRandomChars(4)}`;
    }

    private async generateUniqueSermonSlug(
        title: string,
        code: string,
    ): Promise<string> {
        const base = genSlug(title.trim()) || 'sermon';
        const suffix = code.split('-').pop() || generateRandomChars(6);
        const primary = `${base}-${suffix}`;
        const primaryTaken = await Sermon.findOne({ slug: primary })
            .select('_id')
            .lean();
        if (!primaryTaken) {
            return primary;
        }

        for (let i = 0; i < MAX_SERMON_SLUG_ATTEMPTS; i++) {
            const candidate = `${base}-${generateRandomChars(6)}`;
            const exists = await Sermon.findOne({ slug: candidate })
                .select('_id')
                .lean();
            if (!exists) {
                return candidate;
            }
        }

        return `${base}-${Date.now()}`;
    }

    /**
     * @name buildPublishSermonDTO
     * @description Merges studio input with existing pipeline fields for publish/draft save.
     */
    public buildPublishSermonDTO(
        doc: ISermonDoc,
        input: PublishSermonInputDTO,
    ): PublishSermonDTO {
        const pipeline = this.buildSermonPipelineDTO(doc);
        const { visibility, isAccessiblePublicly } = this.resolveVisibility(
            input.visibility,
            input.isPublic,
        );

        const ministerIds = input.minister
            ? Array.isArray(input.minister)
                ? input.minister
                : [input.minister]
            : Array.isArray(doc.minister)
              ? doc.minister.map((m) => this.ministerIdFromDoc(m))
              : [];

        const publishedAt =
            input.publishedAt instanceof Date
                ? input.publishedAt.toISOString()
                : input.publishedAt
                  ? String(input.publishedAt)
                  : new Date().toISOString();

        return {
            code: doc.code ?? '',
            slug: doc.slug ?? '',
            title: input.title,
            description: input.description,
            playbackUrl: pipeline.playbackUrl,
            manifestUrl: pipeline.manifestUrl,
            imageUrl: pipeline.imageUrl,
            duration: pipeline.duration,
            mimeType: pipeline.mimeType,
            bitrate: pipeline.bitrate,
            protocol: pipeline.protocol,
            quality: pipeline.quality,
            topic: input.topic,
            tags: input.tags ?? [],
            language: input.language?.trim() || doc.language || 'en',
            isPublic: isAccessiblePublicly,
            visibility,
            preachedAt: input.preachedAt,
            preachedYear: input.preachedYear,
            minister: ministerIds.filter(Boolean),
            allowDownload: input.allowDownload ?? doc.allowDownload ?? true,
            allowComment: input.allowComment ?? doc.allowComment ?? true,
            sermon: doc.item?.itemId ?? String(doc._id),
            item: pipeline.item,
            image: pipeline.image,
            isSeries: input.isSeries ?? doc.isSeries ?? false,
            series: input.series ?? '',
            playlist: input.playlist ?? '',
            status: input.status,
            isPublished: input.isPublished,
            publishedBy: input.publishedBy,
            publishedAt,
        };
    }

    /**
     * @name handlePublishSermon
     * @description Persists publish/draft metadata and lifecycle fields on the sermon document.
     */
    public async handlePublishSermon(
        sermonId: string,
        data: PublishSermonDTO,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const findSermon = await sermonRepository.findBySermonId(sermonId);
            if (findSermon.error || !findSermon.data) {
                result.error = true;
                result.message = findSermon.message || 'Sermon not found';
                result.code = 404;
                return result;
            }

            const { visibility, isAccessiblePublicly } = this.resolveVisibility(
                data.visibility,
                data.isPublic,
            );

            const updateData: Partial<ISermonDoc> = {
                title: data.title,
                description: data.description,
                preachedAt: data.preachedAt,
                preachedYear: data.preachedYear,
                language: data.language,
                topic: data.topic as ISermonDoc['topic'],
                tags: data.tags,
                visibility,
                isPublic: isAccessiblePublicly,
                allowDownload: data.allowDownload,
                allowComment: data.allowComment,
                isSeries: data.isSeries,
                status: data.status,
                publishedBy:
                    data.publishedBy as unknown as ISermonDoc['publishedBy'],
            };

            if (data.isSeries && data.series?.trim()) {
                updateData.series = data.series as ISermonDoc['series'];
            } else if (!data.isSeries) {
                updateData.series = null as unknown as ISermonDoc['series'];
            }

            if (data.playlist?.trim()) {
                updateData.playlist = data.playlist as ISermonDoc['playlist'];
            }

            if (data.minister?.length) {
                updateData.minister = data.minister as ISermonDoc['minister'];
            }

            if (data.status === MediaStatus.PUBLISHED) {
                updateData.isPublished = true;
                updateData.publishedAt = data.publishedAt
                    ? new Date(data.publishedAt)
                    : new Date();
                const baseUrl = (process.env.CLIENT_APP_URL || '').replace(
                    /\/$/,
                    '',
                );
                if (baseUrl) {
                    updateData.shareableUrl = `${baseUrl}/sermon/${sermonId}`;
                }
            } else {
                updateData.isPublished = false;
            }

            if (data.playbackUrl) updateData.playbackUrl = data.playbackUrl;
            if (data.manifestUrl) updateData.manifestUrl = data.manifestUrl;
            if (data.imageUrl) updateData.imageUrl = data.imageUrl;
            if (data.duration) updateData.duration = data.duration;
            if (data.mimeType) updateData.mimeType = data.mimeType;
            if (data.bitrate) updateData.bitrate = data.bitrate;
            if (data.protocol) updateData.protocol = data.protocol;
            if (data.quality) updateData.quality = data.quality;

            if (data.code?.trim()) {
                updateData.code = data.code.trim();
            }
            if (data.slug?.trim()) {
                updateData.slug = data.slug.trim();
            }

            const updateResult = await sermonRepository.updateSermon(
                sermonId,
                updateData,
            );
            if (updateResult.error || !updateResult.data) {
                result.error = true;
                result.message = updateResult.message || 'Failed to publish sermon';
                result.code = updateResult.code || 500;
                return result;
            }

            result.message =
                data.status === MediaStatus.PUBLISHED
                    ? 'Sermon published successfully'
                    : 'Sermon draft saved successfully';
            result.data = updateResult.data;
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
     * @name validateSermonInput
     * @description Validates the required fields before a sermon can be published.
     * @param {PublishSermonInputDTO} data - The sermon publish data to validate.
     * @returns {Promise<IResult>} A structured result containing validation success or error messages.
     */
    public async validateSermonInput(
        data: PublishSermonInputDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const validVisibility = new Set<string>(
            Object.values(SermonVisibilityStatus),
        );

        if (!data.title?.trim()) {
            result.error = true;
            result.code = 400;
            result.message = 'Title is required';
        } else if (!data.description?.trim()) {
            result.error = true;
            result.code = 400;
            result.message = 'Description is required';
        } else if (!data.topic?.trim()) {
            result.error = true;
            result.code = 400;
            result.message = 'topic is required';
        } else if (!data.preachedAt) {
            result.error = true;
            result.code = 400;
            result.message = 'Preached date is required';
        } else if (!data.preachedYear) {
            result.error = true;
            result.code = 400;
            result.message = 'Preached year is required';
        } else if (data.tags == null) {
            result.error = true;
            result.code = 400;
            result.message = 'Tags are required';
        } else if (data.visibility == null && data.isPublic == null) {
            result.error = true;
            result.code = 400;
            result.message = 'Visibility is required';
        } else if (
            data.visibility != null &&
            !validVisibility.has(data.visibility)
        ) {
            result.error = true;
            result.code = 400;
            result.message = 'Visibility is invalid';
        } else if (data.isSeries == null) {
            result.error = true;
            result.code = 400;
            result.message = 'Series status is required';
        } else if (!data.publishedBy) {
            result.error = true;
            result.code = 400;
            result.message = 'Published by is required';
        } else if (!data.status) {
            result.error = true;
            result.code = 400;
            result.message = 'Status is required';
        } else if (data.isPublished == null) {
            result.error = true;
            result.code = 400;
            result.message = 'isPublished is required';
        } else {
            result.error = false;
            result.message = '';
        }

        return result;
    }

    /**
     * @name validateSermonPublish
     * @description Alias for studio input validation on full publish snapshots.
     */
    public async validateSermonPublish(
        data: PublishSermonDTO,
    ): Promise<IResult> {
        return this.validateSermonInput(data);
    }

    /**
     * @name validateSermonReadyToPublish
     * @description Validates studio input plus pipeline fields before mobile/catalog.
     * @param {PublishSermonDTO} data - Full publish snapshot (`PublishSermonInputDTO` + `SermonPipelineDTO` fields).
     * @returns {Promise<IResult>} A structured result containing validation success or error messages.
     */
    public async validateSermonReadyToPublish(
        data: PublishSermonDTO,
    ): Promise<IResult> {
        const inputResult = await this.validateSermonPublish(data);
        if (inputResult.error) {
            return inputResult;
        }

        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!data.code) {
            result.error = true;
            result.code = 400;
            result.message = 'Code is required';
        } else if (!data.slug) {
            result.error = true;
            result.code = 400;
            result.message = 'Slug is required';
        } else if (!data.duration) {
            result.error = true;
            result.code = 400;
            result.message = 'Duration is required';
        } else if (!data.sermon) {
            result.error = true;
            result.code = 400;
            result.message = 'Sermon File is required';
        } else if (!data.image) {
            result.error = true;
            result.code = 400;
            result.message = 'Image File is required';
        } else if (!data.item) {
            result.error = true;
            result.code = 400;
            result.message = 'Audio item is required';
        } else if (!data.item.item) {
            result.error = true;
            result.code = 400;
            result.message = 'Original Audio/Sermon item URL is required';
        } else if (!data.image.item) {
            result.error = true;
            result.code = 400;
            result.message = 'Original Sermon image URL is required';
        } else if (!data.imageUrl?.trim()) {
            result.error = true;
            result.code = 400;
            result.message = 'Cover image CDN URL is required';
        } else if (!data.playbackUrl) {
            result.error = true;
            result.code = 400;
            result.message = 'Playback is not ready (wait for processing)';
        } else if (!data.manifestUrl) {
            result.error = true;
            result.code = 400;
            result.message = 'Manifest is not ready (wait for processing)';
        } else if (!data.mimeType) {
            result.error = true;
            result.code = 400;
            result.message = 'MIME type is required';
        } else if (!data.protocol) {
            result.error = true;
            result.code = 400;
            result.message = 'Streaming protocol is required';
        // } else if (!data.quality) {
        //     result.error = true;
        //     result.code = 400;
        //     result.message = 'Streaming quality is required';
        // } else if (!data.bitrate) {
            result.error = true;
            result.code = 400;
            result.message = 'Bitrate is required';
        } else if (!data.status || data.status !== MediaStatus.PUBLISHED) {
            result.error = true;
            result.code = 400;
            result.message = 'Sermon must be published';
        } else {
            result.error = false;
            result.message = '';
        }

        return result;
    }

    public resolveVisibility(
        visibility?: SermonVisibilityStatus,
        isPublic?: boolean,
    ): {
        visibility: SermonVisibilityStatus;
        isAccessiblePublicly: boolean;
    } {
        let resolvedVisibility: SermonVisibilityStatus;

        if (visibility === SermonVisibilityStatus.PUBLIC) {
            resolvedVisibility = SermonVisibilityStatus.PUBLIC;
        } else if (visibility === SermonVisibilityStatus.PRIVATE) {
            resolvedVisibility = SermonVisibilityStatus.PRIVATE;
        } else if (visibility === SermonVisibilityStatus.UNLISTED) {
            resolvedVisibility = SermonVisibilityStatus.UNLISTED;
        } else if (isPublic === false) {
            resolvedVisibility = SermonVisibilityStatus.PRIVATE;
        } else {
            resolvedVisibility = SermonVisibilityStatus.PUBLIC;
        }

        let isAccessiblePublicly: boolean;

        if (resolvedVisibility === SermonVisibilityStatus.PRIVATE) {
            isAccessiblePublicly = false;
        } else {
            isAccessiblePublicly = true;
        }

        const result: {
            visibility: SermonVisibilityStatus;
            isAccessiblePublicly: boolean;
        } = {
            visibility: resolvedVisibility,
            isAccessiblePublicly,
        };

        return result;
    }

    /**
     * @name markSermonPublished
     * @description Sets published lifecycle on doc (like activateAccount).
     */
    public async markSermonPublished(
        sermon: ISermonDoc,
        publishedBy: string,
    ): Promise<void> {
        const id = String(sermon._id ?? sermon.id ?? '');
        await sermonRepository.updateSermon(id, {
            status: MediaStatus.PUBLISHED,
            isPublished: true,
            publishedAt: new Date(),
            publishedBy:
                publishedBy as unknown as ISermonDoc['publishedBy'],
        });
    }
    /**
     * @name markSermonDraft
     * @description Keeps metadata, returns to draft (save without going live).
     */
    public async markSermonDraft(sermon: ISermonDoc): Promise<void> {
        const id = String(sermon._id ?? sermon.id ?? '');
        await sermonRepository.updateSermon(id, {
            status: MediaStatus.DRAFT,
            isPublished: false,
        });
    }

    /**
     * @name markSermonAsCancelled
     * @description Sets upload pipeline status to cancelled (draft sermon stays in library).
     * @returns true when a sermon document was updated.
     */
    public async markSermonAsCancelled(
        uploadId: string,
        sermonId?: string | mongoose.Types.ObjectId,
    ): Promise<boolean> {
        const updated = await sermonRepository.markUploadProcessingCancelled(
            uploadId,
            sermonId,
        );
        return updated != null;
    }

    /**
     * @name checkSermonProcessingCancelled
     * @description Worker guard — true when processing was cancelled via API or markSermonAsCancelled.
     */
    public async checkSermonProcessingCancelled(
        uploadId: string,
        sermonId?: string | mongoose.Types.ObjectId,
    ): Promise<boolean> {
        return sermonRepository.isUploadProcessingCancelled(uploadId, sermonId);
    }

    /**
     * @name markSermonUploadProcessing
     * @description HLS worker: set sermon to pending + `item.uploadStatus: processing`.
     */
    public async markSermonUploadProcessing(
        uploadId: string,
        sermonId?: string | mongoose.Types.ObjectId,
    ): Promise<void> {
        await sermonRepository.markUploadPipelineProcessing(uploadId, sermonId);
    }

    public async markSermonUploadCompleted(
        uploadId: string,
        sermonId: string | mongoose.Types.ObjectId | undefined,
        manifestUrl: string,
    ): Promise<void> {
        await sermonRepository.markUploadPipelineCompleted(
            uploadId,
            sermonId,
            manifestUrl,
        );
    }

    public async markSermonUploadTerminal(
        uploadId: string,
        sermonId: string | mongoose.Types.ObjectId | undefined,
        uploadStatus: UploadStatus.FAILED | UploadStatus.CANCELLED,
    ): Promise<void> {
        await sermonRepository.markUploadPipelineTerminal(
            uploadId,
            sermonId,
            uploadStatus,
        );
    }

    /**
     * @name CheckAudioReadyForPublish
     * @description System fields from upload + jobs — call only when publishing live.
     */
    public CheckAudioReadyForPublish(sermon: ISermonDoc): IResult {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const uploadStatus = sermon.item?.uploadStatus;
        if (uploadStatus !== UploadStatus.COMPLETED) {
            result.error = true;
            result.code = 409;
            result.message = 'Audio processing is not complete';
            return result;
        }

        const playbackUrl = sermon.playbackUrl?.trim();
        const manifestUrl = sermon.manifestUrl?.trim();
        const itemUrl = sermon.item?.item?.trim();
        if (!playbackUrl && !manifestUrl && !itemUrl) {
            result.error = true;
            result.code = 409;
            result.message = 'Playback is not ready';
            return result;
        }

        if (!sermon.imageUrl?.trim()) {
            result.error = true;
            result.code = 400;
            result.message = 'Cover image is required';
            return result;
        }

        if (!sermon.duration || sermon.duration <= 0) {
            result.error = true;
            result.code = 409;
            result.message = 'Duration is not ready';
            return result;
        }

        return result;
    }

    /**
     * @name buildSermonRelationships
     * @description Minister, series, playlist, topic, tags on the sermon doc.
     */
    public async buildSermonRelationships(
        sermon: ISermonDoc,
        data: PublishSermonInputDTO,
    ): Promise<void> {
        sermon.topic = data.topic as unknown as ISermonDoc['topic'];
        sermon.tags = data.tags;

        const ministerIds = Array.isArray(data.minister)
            ? data.minister
            : [data.minister];
        sermon.minister = ministerIds as unknown as ISermonDoc['minister'];

        sermon.isSeries = data.isSeries;
        if (data.isSeries && data.series?.trim()) {
            sermon.series = data.series as unknown as ISermonDoc['series'];
        } else if (!data.isSeries) {
            sermon.series = null as unknown as ISermonDoc['series'];
        }

        if (data.playlist?.trim()) {
            sermon.playlist =
                data.playlist as unknown as ISermonDoc['playlist'];
        }
    }

    /**
     * @name attachPublishingSettings
     * @description Listener-facing flags (like updateUserType on IUserDoc).
     */
    public async attachPublishingSettings(
        sermon: ISermonDoc,
        data: PublishSermonInputDTO,
    ): Promise<void> {
        const { visibility, isAccessiblePublicly } = this.resolveVisibility(
            data.visibility,
            data.isPublic,
        );

        sermon.visibility = visibility;
        sermon.isPublic = isAccessiblePublicly;
        sermon.allowDownload = data.allowDownload;
        sermon.allowComment = data.allowComment;
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
        const sermonId = String(sermon._id ?? sermon.id ?? '');
        const baseUrl = appUrl || (process.env.CLIENT_APP_URL as string);
        const base = (baseUrl || '').replace(/\/$/, '');
        const shareableUrl = `${base}/sermon/${sermonId}`;

        const updateResult = await sermonRepository.updateSermon(sermonId, {
            shareableUrl,
        });
        if (updateResult.error) {
            throw new Error(updateResult.message || 'Sermon not found');
        }
    }

    private isAdminRole(role: unknown): boolean {
        const normalized = String(role ?? '').toLowerCase();
        return (
            normalized === UserType.ADMIN || normalized === UserType.SUPERADMIN
        );
    }

    private parseBooleanFlag(value: unknown): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value !== 'string') return false;
        const normalized = value.trim().toLowerCase();
        return (
            normalized === 'true' || normalized === '1' || normalized === 'yes'
        );
    }

    private ministerIdFromDoc(minister: unknown): string {
        if (minister == null) return '';
        if (
            typeof minister === 'object' &&
            minister !== null &&
            '_id' in minister
        ) {
            return String((minister as { _id: unknown })._id);
        }
        return String(minister);
    }

    private ministerIdsFromDoc(minister: unknown): string[] {
        if (minister == null) return [];
        const entries = Array.isArray(minister) ? minister : [minister];
        const ids: string[] = [];
        for (const entry of entries) {
            const id = this.ministerIdFromDoc(entry).trim();
            if (id && mongoose.Types.ObjectId.isValid(id)) {
                ids.push(id);
            }
        }
        return ids;
    }

    private uploaderUserId(doc: Record<string, unknown>): string {
        const item = doc.item as { uploadedBy?: unknown } | undefined;
        if (item?.uploadedBy == null) return '';
        const raw = item.uploadedBy;
        if (
            typeof raw === 'object' &&
            raw !== null &&
            '_id' in raw
        ) {
            return String((raw as { _id: unknown })._id);
        }
        return String(raw).trim();
    }

    private userIdsEqual(a: string, b: string): boolean {
        if (!a || !b) return false;
        const left = String(a).trim();
        const right = String(b).trim();
        if (left === right) return true;
        if (
            mongoose.Types.ObjectId.isValid(left) &&
            mongoose.Types.ObjectId.isValid(right)
        ) {
            return new mongoose.Types.ObjectId(left).equals(
                new mongoose.Types.ObjectId(right),
            );
        }
        return false;
    }

    private isPublishedCatalogSermon(doc: Record<string, unknown>): boolean {
        return (
            doc.isPublic !== false &&
            doc.status === MediaStatus.PUBLISHED &&
            doc.state !== ContentState.DELETED &&
            doc.state !== ContentState.BROKEN
        );
    }

    private async ministerProfileOwnedByUser(
        userId: string,
        ministerProfileId: string,
    ): Promise<boolean> {
        if (
            !userId ||
            !ministerProfileId ||
            !mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(ministerProfileId)
        ) {
            return false;
        }
        const owned = await Minister.findOne({
            _id: new mongoose.Types.ObjectId(ministerProfileId),
            user: new mongoose.Types.ObjectId(userId),
        })
            .select('_id')
            .lean();
        return !!owned;
    }

    /** Legacy rows that stored JWT user id in `minister` instead of minister profile id. */
    private async legacyUserIdAsMinisterRef(
        userId: string,
        ministerRef: string,
    ): Promise<boolean> {
        if (ministerRef !== userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return false;
        }
        const uid = new mongoose.Types.ObjectId(userId);
        const [ministerByUser, creatorByUser] = await Promise.all([
            Minister.findOne({ user: uid }).select('_id').lean(),
            Creator.findOne({ user: uid }).select('_id').lean(),
        ]);
        return !!(ministerByUser || creatorByUser);
    }

    /**
     * Whether an authenticated user may read sermon detail (GET /sermon/:id).
     * Published catalog sermons, uploader, and studio owner (minister/creator) pass.
     */
    public async canUserViewSermonDetail(
        userId: string,
        doc: Record<string, unknown>,
    ): Promise<boolean> {
        if (!userId) return false;
        if (this.isPublishedCatalogSermon(doc)) return true;
        return this.isSermonOwnedByUser(userId, doc);
    }

    public async isSermonOwnedByUser(
        userId: string,
        doc: Record<string, unknown>,
    ): Promise<boolean> {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return false;

        const uploaderId = this.uploaderUserId(doc);
        if (uploaderId && this.userIdsEqual(uploaderId, userId)) {
            return true;
        }

        const ministerIds = this.ministerIdsFromDoc(doc.minister);
        for (const mid of ministerIds) {
            if (await this.ministerProfileOwnedByUser(userId, mid)) {
                return true;
            }
            if (await this.legacyUserIdAsMinisterRef(userId, mid)) {
                return true;
            }
        }
        return false;
    }

    public validateDeletePolicy(data: {
        action: 'delete' | 'move-to-bin';
        sermonStatus: unknown;
        actorRole: unknown;
        isOwner: boolean;
        allowPublishedDelete?: unknown;
    }): IResult {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const isAdmin = this.isAdminRole(data.actorRole);
        const isPublished = data.sermonStatus === MediaStatus.PUBLISHED;

        if (!isAdmin && !data.isOwner) {
            result.error = true;
            result.code = 403;
            result.message =
                data.action === 'delete'
                    ? 'You are not allowed to delete this sermon'
                    : 'You are not allowed to modify this sermon';
            return result;
        }

        if (!isAdmin && isPublished) {
            result.error = true;
            result.code = 403;
            result.message =
                data.action === 'delete'
                    ? 'Published sermons cannot be deleted by non-admin users'
                    : 'Published sermons cannot be moved to bin by non-admin users';
            return result;
        }

        if (
            isAdmin &&
            data.action === 'delete' &&
            isPublished &&
            !this.parseBooleanFlag(data.allowPublishedDelete)
        ) {
            result.error = true;
            result.code = 409;
            result.message =
                'Explicit allowPublishedDelete=true is required to hard-delete a published sermon';
            return result;
        }

        return result;
    }

    public async cancelSermonProcessing(
        sermonId: string,
        actorUserId: string,
        actorRole: unknown,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const sermon = await Sermon.findById(sermonId).lean();
        if (!sermon) {
            result.error = true;
            result.code = 404;
            result.message = 'Sermon not found';
            return result;
        }

        const isOwner = await this.isSermonOwnedByUser(
            actorUserId,
            sermon as Record<string, unknown>,
        );
        const isAdmin = this.isAdminRole(actorRole);
        if (!isOwner && !isAdmin) {
            result.error = true;
            result.code = 403;
            result.message =
                'You are not allowed to cancel this sermon processing';
            return result;
        }

        const uploadStatus = sermon?.item?.uploadStatus;
        if (
            uploadStatus === UploadStatus.COMPLETED ||
            uploadStatus === UploadStatus.FAILED ||
            uploadStatus === UploadStatus.CANCELLED
        ) {
            result.message = `Sermon processing already terminal (${uploadStatus})`;
            result.data = sermon;
            return result;
        }

        const uploadId = sermon?.item?.itemId;
        if (!uploadId) {
            result.error = true;
            result.code = 409;
            result.message =
                'Cannot cancel processing because upload id is missing';
            return result;
        }

        const cancelledDoc =
            await sermonRepository.markUploadProcessingCancelled(
                uploadId,
                sermonId,
            );
        if (!cancelledDoc) {
            result.error = true;
            result.code = 404;
            result.message = 'Sermon not found';
            return result;
        }

        const metaJobId = `audio-meta-${uploadId}`;
        const hlsJobId = `hls-package-${uploadId}`;
        try {
            const [metaQueue, hlsQueue] = await Promise.all([
                BullQueue.createQueue({
                    name: JobChannel.extractAudioMetadata,
                }),
                BullQueue.createQueue({ name: JobChannel.processAudio }),
            ]);

            for (const [queue, jobId] of [
                [metaQueue, metaJobId],
                [hlsQueue, hlsJobId],
            ] as const) {
                const job = await queue.getJob(jobId);
                if (job) {
                    await job.remove();
                }
            }
        } catch (queueError) {
            logger.log({
                data: `cancel-processing queue cleanup warning sermonId=${sermonId} uploadId=${uploadId} err=${
                    queueError instanceof Error
                        ? queueError.message
                        : String(queueError)
                }`,
                label: 'sermon-cancel',
                type: 'warning',
            });
        }

        logger.log({
            data: `cancel-processing success sermonId=${sermonId} uploadId=${uploadId} actor=${actorUserId}`,
            label: 'sermon-cancel',
            type: 'info',
        });

        result.message = 'Sermon processing cancelled successfully';
        result.data = cancelledDoc;
        return result;
    }
}

export default new SermonService();

// audio processing
// metadata extraction
// transcoding
// storing different bitrates
// updating sermon document with processed file info
