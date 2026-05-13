import BullQueue from '../../queues/queue';
import { CreateWorkerDTO } from '@/queues/queue.dto';
import { QueueChannel, JobChannel } from '../../queues/channel.queue';
import logger from '../../utils/logger.util';
import processReminderJob from '../jobs/reminder.job';
import processCleanupJob from '../jobs/cleanup.job';
import processMarketingJob from '../jobs/marketing.job';
import processInvitationJob from '../jobs/invitation.job';

/**
 * Scheduler Workers
 * Creates and manages workers for scheduled job queues using Bull
 */

/**
 * Start all scheduler workers
 */
export const startSchedulerWorkers = async (): Promise<void> => {
    try {
        // Create worker for reminders queue
        const reminderWorkerConfig: CreateWorkerDTO = {
            queueName: QueueChannel.Reminders,
            jobName: JobChannel.SendDailyReminder,
            concurrency: 5, // Process 5 reminder jobs concurrently
        };

        const reminderQueue = await BullQueue.addProcessor(
            reminderWorkerConfig,
            processReminderJob as any,
        );

        // Also process weekly reminders on the same queue
        await BullQueue.addProcessor(
            {
                queueName: QueueChannel.Reminders,
                jobName: JobChannel.SendWeeklyReminder,
                concurrency: 5,
            },
            processReminderJob as any,
        );

        // Create worker for cleanup queue
        const cleanupWorkerConfig: CreateWorkerDTO = {
            queueName: QueueChannel.Cleanup,
            jobName: JobChannel.CleanupTempFiles,
            concurrency: 3, // Process 3 cleanup jobs concurrently
        };

        const cleanupQueue = await BullQueue.addProcessor(
            cleanupWorkerConfig,
            processCleanupJob as any,
        );

        // Also process deep cleanup on the same queue
        await BullQueue.addProcessor(
            {
                queueName: QueueChannel.Cleanup,
                jobName: JobChannel.DeepCleanup,
                concurrency: 3,
            },
            processCleanupJob as any,
        );

        // Create worker for marketing queue
        const marketingWorkerConfig: CreateWorkerDTO = {
            queueName: QueueChannel.Marketing,
            jobName: JobChannel.SendHackathonsThisWeek,
            concurrency: 1, // Process 1 marketing job at a time to avoid overwhelming the email service
        };

        const marketingQueue = await BullQueue.addProcessor(
            marketingWorkerConfig,
            processMarketingJob as any,
        );

        const invitationWorkerConfig: CreateWorkerDTO = {
            queueName: QueueChannel.Invitations,
            jobName: JobChannel.MarkExpiredInvitations,
            concurrency: 2,
        };

        const invitationQueue = await BullQueue.addProcessor(
            invitationWorkerConfig,
            processInvitationJob as any,
        );

        logger.log({
            data: 'Scheduler workers started successfully',
            label: 'scheduler-worker',
            type: 'success',
        });
    } catch (error) {
        logger.log({
            data: `Failed to start scheduler workers: ${
                error instanceof Error ? error.message : String(error)
            }`,
            label: 'scheduler-worker',
            type: 'error',
        });
        throw error;
    }
};

export default startSchedulerWorkers;
