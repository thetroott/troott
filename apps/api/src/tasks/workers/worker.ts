import logger from '../../utils/logger.util';
import startAudioMetadataWorker from './audio.worker';
import startAudioHLSWorker from './audio-processing.worker';
import startEmailWorker from './email.worker';

const startWorkers = async () => {

    const emailWorker = await startEmailWorker();

    const audioMetadataWorker = await startAudioMetadataWorker();
    const audioHLSWorker = await startAudioHLSWorker();

    process.on('SIGTERM', async () => {
        await Promise.all([
            emailWorker.close(),
            audioMetadataWorker.close(),
            audioHLSWorker.close(),
        ]);
        logger.log({
            data: '[SIGTERM]: Shutdown all Queue listeners',
            label: 'worker',
            type: 'info',
        });
    });

    process.on('SIGINT', async () => {
        await Promise.all([
            emailWorker.close(),
            audioMetadataWorker.close(),
            audioHLSWorker.close(),
        ]);
        logger.log({
            data: '[SIGINT]: Shutdown all Queue listeners',
            label: 'worker',
            type: 'info',
        });
    });

    //    await startScheduler();
};

export default startWorkers;
