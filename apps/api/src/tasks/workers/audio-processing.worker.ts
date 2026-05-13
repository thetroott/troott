import BullQueue from '../../queues/queue';
import { CreateWorkerDTO } from '@/queues/queue.dto';
import { JobChannel, QueueChannel } from '../../queues/channel.queue';
import audioHLSProcessor from '../jobs/audio-processing.job';
import logger from '../../utils/logger.util';

/**
 * Bull worker for adaptive **HLS packaging** (`audio:processing` queue).
 */
const startAudioHLSWorker = async () => {
    const queueName: JobChannel = JobChannel.processAudio;
    const jobName: QueueChannel = QueueChannel.AUDIOPROCESSING;

    const audioWorkerConfig: CreateWorkerDTO = {
        queueName,
        jobName,
        concurrency: 2,
    };

    const queue = await BullQueue.addProcessor(
        audioWorkerConfig,
        audioHLSProcessor as any,
    );

    logger.log({
        data: `HLS packaging worker started on ${queueName} (${jobName})`,
        label: 'audio-hls-worker',
        type: 'success',
    });

    return queue;
};

export default startAudioHLSWorker;
