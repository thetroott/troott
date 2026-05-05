import logger from '../../utils/logger.util';
import startAudioMetadataWorker from './audio.worker';
import startAudioHLSWorker from './audio-processing.worker';
import startEmailWorker from './email.worker';

const startWorkers = async () => {
    const audioMetadataWorker = await startAudioMetadataWorker();
    const audioHLSWorker = await startAudioHLSWorker();
    const emailWorker = await startEmailWorker();

    const shutdown = async (signal: string) => {
        await Promise.all([
            audioMetadataWorker.close(),
            audioHLSWorker.close(),
            emailWorker.close(),
        ]);
        logger.log({
            data: `[${signal}]: Shutdown all Queue listeners`,
            label: 'worker',
            type: 'info',
        });
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
};

export default startWorkers;
