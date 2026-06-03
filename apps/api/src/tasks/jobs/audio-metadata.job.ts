import { Job, DoneCallback } from 'bull';
import { FileType } from '@/interfaces/common.interface';
import Sermon from '@/models/core/sermon.model';
import logger from '../../utils/logger.util';
import type { IAudioMetadata } from '@/interfaces/core/sermon.interface';
import { MediaStatus, UploadStatus } from '@/interfaces/core/sermon.interface';
import storageService from '@/services/storage.service';
import { IAudioMetadataJobDTO } from '@/dtos/core/sermon.dto';

const audioMetadataProcessor = async (
    job: Job<IAudioMetadataJobDTO>,
    done: DoneCallback,
) => {
    const { sourceS3Key, mimeType, uploadId, sermonId } = job.data;
    if (!sourceS3Key || !mimeType || !uploadId) {
        return done(
            new Error(
                'Invalid audio metadata job payload: sourceS3Key, mimeType, and uploadId are required.',
            ),
        );
    }

    const started = Date.now();
    const waitMs =
        typeof job.timestamp === 'number'
            ? Math.max(0, started - job.timestamp)
            : -1;
    logger.log({
        data: `event=job-start queue=audio:metadata uploadId=${uploadId} jobId=${job.id} waitMs=${waitMs}`,
        label: 'audio-metadata-processor',
        type: 'info',
    });

    try {
        const query = sermonId
            ? { _id: sermonId }
            : { 'item.itemId': uploadId };

        const beforeStart = await Sermon.findOne(query)
            .select('item.uploadStatus')
            .lean();
        if (beforeStart?.item?.uploadStatus === UploadStatus.CANCELLED) {
            logger.log({
                data: `Metadata extraction skipped (cancelled) uploadId=${uploadId} job=${job.id}`,
                label: 'audio-metadata-processor',
                type: 'info',
            });
            return done(null, { cancelled: true });
        }

        const streamResult = await storageService.getObjectStream(sourceS3Key);
        if (streamResult.error || !streamResult.stream) {
            throw new Error(
                streamResult.message || 'Failed to open S3 object stream',
            );
        }

        const contentLength =
            typeof streamResult.data?.contentLength === 'number'
                ? streamResult.data.contentLength
                : undefined;

        const { parseStream } = await import('music-metadata');

        const mmMetadata = await parseStream(streamResult.stream, mimeType, {
            duration: true,
        });

        const metadata: IAudioMetadata = {
            metadataType: FileType.AUDIO,
            formatName: mmMetadata.format.container,
            codec: mmMetadata.format.codec,
            duration: mmMetadata.format.duration,
            bitrate: mmMetadata.format.bitrate,
            year: mmMetadata.common.year,
        };

        const durationSec =
            typeof metadata.duration === 'number'
                ? Math.round(metadata.duration)
                : undefined;
        const bitrateKbps =
            typeof metadata.bitrate === 'number'
                ? Math.round(metadata.bitrate / 1000)
                : undefined;

        const updateSermon = await Sermon.findOneAndUpdate(
            query,
            {
                $set: {
                    duration: durationSec,
                    bitrate: bitrateKbps,
                    mimeType,
                    status: MediaStatus.DRAFT,
                    'item.duration': durationSec ?? 0,
                    'item.uploadStatus': UploadStatus.EXTRACTING,
                    'item.updatedAt': new Date().toISOString(),
                },
            },
            { new: true },
        );

        if (!updateSermon) {
            const errorMessage = `Sermon with uploadId ${uploadId} not found.`;
            logger.log({
                data: errorMessage,
                label: 'audio-metadata-processor',
                type: 'error',
            });
            return done(new Error(errorMessage));
        }

        logger.log({
            data: `Metadata extracted uploadId=${uploadId} job=${job.id} ms=${Date.now() - started} s3GetBytes=${contentLength ?? 'unknown'}`,
            label: 'audio-metadata-processor',
            type: 'success',
        });

        done(null, updateSermon);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message === 'Sermon processing cancelled') {
            return done(null, { cancelled: true });
        }
        logger.log({
            data: `Critical error during processing of Audio Job ID: ${job.id}. Error: ${message}`,
            label: 'audio-processor-critical',
            type: 'error',
        });

        done(error as Error);
    }
};

export default audioMetadataProcessor;
