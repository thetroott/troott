
import logger from "../../utils/logger.util";
import startAudioMetadataWorker from "./audio.worker";
import startEmailWorker from "./email.worker";


const startWorkers = async () => {
    
    const audioMetadataWorker = await startAudioMetadataWorker()
    const emailWorker = await startEmailWorker();
    //

    process.on('SIGTERM', async () => {
        await Promise.all([
            audioMetadataWorker.close(),
            emailWorker.close(),
            
        ])
        logger.log({ data: '[SIGTERM]: Shutdown all Queue listeners', label: "worker", type: "info" });

    })

    process.on('SIGINT', async () => {
        await Promise.all([
            emailWorker.close()

        ])
        logger.log({ data: '[SIGINT]: Shutdown all Queue listeners', label: "worker", type: "info" });

    })
}

export default startWorkers;