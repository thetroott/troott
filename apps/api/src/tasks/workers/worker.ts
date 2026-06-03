import logger from '../../utils/logger.util';
import startAudioMetadataWorker from './audio-metadata.worker';
import startAudioHLSWorker from './audio-processing.worker';
import startEmailWorker from './email.worker';

type ClosableQueue = { close: () => Promise<void> };

let workerQueues: ClosableQueue[] = [];

export const shutdownWorkers = async (): Promise<void> => {
    if (!workerQueues.length) {
        return;
    }
    await Promise.all(workerQueues.map((q) => q.close()));
    logger.log({
        data: 'Shutdown all Queue listeners',
        label: 'worker',
        type: 'info',
    });
    workerQueues = [];
};

const startWorkers = async () => {
    const emailWorker = await startEmailWorker();
    const audioMetadataWorker = await startAudioMetadataWorker();
    const audioHLSWorker = await startAudioHLSWorker();

    workerQueues = [emailWorker, audioMetadataWorker, audioHLSWorker];
};

export default startWorkers;
