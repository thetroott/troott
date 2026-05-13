import BullQueue from '../../queues/queue';
import { CreateWorkerDTO } from '@/queues/queue.dto';
import { JobChannel, QueueChannel } from '../../queues/channel.queue';
import audioMetadataProcessor from '../jobs/audio-metadata.job';
import logger from '../../utils/logger.util';

/**
 * @name startAudioMetadataWorker
 * @description Starts the Bull worker for the Audio Metadata Queue.
 * @returns The Bull Queue instance
 */
const startAudioMetadataWorker = async () => {
    // JOB: The queue channel that will be monitored for new jobs
    const queueName: JobChannel = JobChannel.extractAudioMetadata;

    // JOB NAME: The specific name the processor listens for
    const jobName: QueueChannel = QueueChannel.AUDIOMETADATA;

    // PROCESSOR: The function to execute when a job is received
    const processor = await audioMetadataProcessor;

    const audioWorkerConfig: CreateWorkerDTO = {
        queueName,
        jobName,
        concurrency: 10,
    };

    // Calls the provided addProcessor logic from your BullQueue class
    const queue = await BullQueue.addProcessor(
        audioWorkerConfig,
        processor as any,
    );

    logger.log({
        data: `Audio Worker started and listening on: ${queueName} (${jobName})`,
        label: 'audio-worker',
        type: 'success',
    });

    return queue;
};

export default startAudioMetadataWorker;
