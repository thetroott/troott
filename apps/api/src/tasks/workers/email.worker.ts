import BullQueue from '../../queues/queue';
import { CreateWorkerDTO } from '../../queues/queue.dto';
import { JobChannel, QueueChannel } from '../../queues/channel.queue';
import emailProcessor from '../jobs/email.job';
import logger from '../../utils/logger.util';

/**
 * @name startEmailWorker
 * @description Starts the Bull worker for the Email Queue.
 * @returns The Bull Queue instance
 */
const startEmailWorker = async () => {
    // JOB: The queue channel that will be monitored for new jobs
    const queueName: JobChannel = JobChannel.SendEmail;

    // JOB NAME: The specific name the processor listens for, as used in addJob (QueueChannel.Emails)
    const jobName: QueueChannel = QueueChannel.Emails;

    // PROCESSOR: The function to execute when a job is received
    const processor = await emailProcessor;

    const emailWorkerConfig: CreateWorkerDTO = {
        queueName,
        jobName,
        concurrency: 20,
    };

    // Calls the provided addProcessor logic
    const queue = await BullQueue.addProcessor(
        emailWorkerConfig,
        processor as any,
    );

    logger.log({
        data: `Email Worker started and listening on: ${queueName} (${jobName})`,
        label: 'email-worker',
        type: 'success',
    });

    return queue;
};

export default startEmailWorker;
