import { Job, DoneCallback } from 'bull';
import logger from '../../utils/logger.util';

/**
 * Process reminder job
 * This is the worker function that processes reminder jobs from the queue
 * Follows the Bull pattern with Job and DoneCallback
 */
const processReminderJob = async (
    job: Job,
    done: DoneCallback,
): Promise<void> => {
    const { type, message } = job.data;

    logger.log({
        data: `Processing reminder job: ${type} - ${message}`,
        label: 'reminder-job',
        type: 'info',
    });

    try {
        // TODO: Implement your reminder logic here
        // Example: Send notifications, update database, etc.

        logger.log({
            data: `Reminder job ${job.id} completed successfully`,
            label: 'reminder-job',
            type: 'success',
        });

        // Success: Call done(null, result) to mark the job as completed successfully
        done(null, { success: true, type, message });
    } catch (error) {
        logger.log({
            data: `Reminder job ${job.id} failed: ${
                error instanceof Error ? error.message : String(error)
            }`,
            label: 'reminder-job',
            type: 'error',
        });

        // Signal Bull that the job failed
        done(error as Error);
    }
};

export default processReminderJob;
