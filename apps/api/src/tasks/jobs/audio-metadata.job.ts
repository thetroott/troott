import { Job } from 'bull';
import { FileType } from '@/interfaces/common.interface';
import Sermon from '@/models/core/sermon.model';
import { DoneCallback } from 'bull';
import logger from '../../utils/logger.util';
import type {
    IAudioMetadata,
    IAudioMetadataJobDTO,
} from '@/interfaces/core/sermon.interface';
import { MediaStatus, UploadStatus } from '@/interfaces/core/sermon.interface';

/**
 * @name audioMetadataProcessor
 * @description The core function that the Bull worker executes for each 'audio:metadata' job.
 * It extracts metadata and updates the database, using the 'done' callback to signal completion.
 * @param job The Bull job object containing the audio data reference
 * @param done The Bull done callback function
 */
const audioMetadataProcessor = async (
    job: Job<IAudioMetadataJobDTO>,
    done: DoneCallback,
) => {
    const { streamForMetadata, mimeType, uploadId, sermonId } = job.data;
    if (!streamForMetadata || !mimeType || !uploadId) {
        return done(
            new Error(
                'Invalid audio metadata job payload: streamForMetadata, mimeType, and uploadId are required.',
            ),
        );
    }

    try {
        let metadata: IAudioMetadata;

        const { parseStream } = await import('music-metadata');

        const mmMetadata = await parseStream(streamForMetadata, mimeType, {
            duration: true,
        });

        metadata = {
            metadataType: FileType.AUDIO,
            formatName: mmMetadata.format.container,
            codec: mmMetadata.format.codec,
            duration: mmMetadata.format.duration,
            bitrate: mmMetadata.format.bitrate,
            year: mmMetadata.common.year,
        };

        const query = sermonId
            ? { _id: sermonId }
            : { 'item.itemId': uploadId };

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
            data: `Metadata extracted uploadId=${uploadId} job=${job.id}`,
            label: 'audio-metadata-processor',
            type: 'success',
        });

        done(null, updateSermon);
    } catch (error) {
        logger.log({
            data: `Critical error during processing of Audio Job ID: ${job.id}. Error: ${error instanceof Error ? error.message : String(error)}`,
            label: 'audio-processor-critical',
            type: 'error',
        });

        done(error as Error);
    }
};

export default audioMetadataProcessor;
