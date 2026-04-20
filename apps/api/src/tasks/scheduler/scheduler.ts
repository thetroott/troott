import schedulerService from '../../modules/internals/scheduler/scheduler.service';
import startScheduledJobs from './scheduler.config';
import startSchedulerWorkers from '@/tasks/workers/scheduler.worker';
import logger from '../../utils/logger.util';
import BullQueue from '../../queues/queue';
import { QueueChannel } from '../../queues/channel.queue';

/**
 * Start the scheduler system
 * This function should be called during application startup
 */
export const startScheduler = async (): Promise<void> => {
    try {
        // Start scheduler workers first
        await startSchedulerWorkers();

        // Start all scheduled jobs
        startScheduledJobs();

        logger.log({
            data: 'Scheduler system started successfully',
            label: 'scheduler-init',
            type: 'success',
        });
    } catch (error) {
        logger.log({
            data: `Failed to start scheduler: ${
                error instanceof Error ? error.message : String(error)
            }`,
            label: 'scheduler-init',
            type: 'error',
        });
        throw error;
    }
};

/**
 * Shutdown the scheduler system gracefully
 */
export const shutdownScheduler = async (): Promise<void> => {
    try {
        // Stop all scheduled cron jobs
        schedulerService.stopAll();

        // Close all Bull queues used by scheduler
        await schedulerService.closeAllQueues();

        // Close specific scheduler queues
        await BullQueue.closeQueue(QueueChannel.Reminders);
        await BullQueue.closeQueue(QueueChannel.Cleanup);
        await BullQueue.closeQueue(QueueChannel.Marketing);
        await BullQueue.closeQueue(QueueChannel.Invitations);

        logger.log({
            data: 'Scheduler system shut down successfully',
            label: 'scheduler-init',
            type: 'info',
        });
    } catch (error) {
        logger.log({
            data: `Error during scheduler shutdown: ${
                error instanceof Error ? error.message : String(error)
            }`,
            label: 'scheduler-init',
            type: 'error',
        });
    }
};

export default startScheduler;
