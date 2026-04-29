
import { Job, DoneCallback } from 'bull';
import audioProcessing from '@/modules/core/processes/audio-processing';
import Sermon from '@/modules/core/sermon/sermon.model';
import logger from '../../utils/logger.util';
import { IAudioDASHJobDTO, AudioRenditionDTO } from '@/modules/core/sermon/sermon.interface';
import { PassThrough } from 'stream';

const audioDASHProcessor = async (
    job: Job<IAudioDASHJobDTO>,
    done: DoneCallback,
) => {
    const { uploadId, renditions, inputStream } = job.data;

    try {
        // Create output streams in-memory for each rendition
        const outputStreams: Record<string, PassThrough> = {};
        const renditionsL: AudioRenditionDTO[] = renditions || [
            { name: 'low', bitrate: 64, sampleRate: 44100, channels: 2 },
            { name: 'medium', bitrate: 128, sampleRate: 44100, channels: 2 },
            { name: 'high', bitrate: 192, sampleRate: 44100, channels: 2 },
        ];

        // Prepare empty PassThrough streams for each rendition
        for (const r of renditionsL) {
            outputStreams[r.name] = new PassThrough();
        }

        // Process DASH fully in-memory
        const result = await audioProcessing.ProcessDASH({
            inputStream,
            renditions: renditionsL,
            outputStreams,
            segmentDuration: 6,
        });

        // Update DB (you could store metadata or segment info instead of path)
        await Sermon.findOneAndUpdate(
            { 'uploadSummary.uploadId': uploadId },
            {
                $set: {
                    'uploadSummary.dashReady': true,
                    uploadState: 'AUDIO_DASH_READY',
                },
            },
        );

        logger.log({
            data: `DASH packaged for job ID ${job.id}`,
            label: 'audio-dash-processor',
            type: 'success',
        });

        // Return the in-memory streams
        done(null, result.data);
    } catch (err: any) {
        logger.log({
            data: `DASH packaging failed for job ID ${job.id}. Error: ${err.message}`,
            label: 'audio-dash-processor',
            type: 'error',
        });
        done(err);
    }
};

export default audioDASHProcessor;
