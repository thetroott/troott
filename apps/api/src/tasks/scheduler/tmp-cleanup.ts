import schedulerService from '@/services/scheduler.service';
import { ScheduledJobConfig } from '@/services/scheduler.service';
import { QueueChannel, JobChannel } from '../../queues/channel.queue';
import { CronPatterns } from '../cron/cron.patterns';

/**
 * Temporary File Cleanup Scheduled Jobs
 * Define all cleanup-related scheduled jobs here
 *
 * Cron pattern format: "* * * * *"
 *  | | | | |
 *  | | | | └─── day of week (0-7, where 0 and 7 are Sunday)
 *  | | | └───── month (1-12)
 *  | | └─────── day of month (1-31)
 *  | └───────── hour (0-23)
 *  └─────────── minute (0-59)
 */

// Cleanup temporary files every hour
const hourlyCleanupJob: ScheduledJobConfig = {
    name: 'hourly-tmp-cleanup',
    cronPattern: CronPatterns.EVERY_HOUR, // Every hour at minute 0
    queueName: QueueChannel.Cleanup,
    jobName: JobChannel.CleanupTempFiles,
    data: {
        type: 'temp-files',
        maxAge: 3600, // 1 hour in seconds
    },
    options: {
        attempts: 2,
        removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
        },
    },
    enabled: true,
};

// Deep cleanup of old temporary files daily at 2 AM
const dailyDeepCleanupJob: ScheduledJobConfig = {
    name: 'daily-deep-cleanup',
    cronPattern: CronPatterns.DAILY_2AM, // Every day at 2:00 AM
    queueName: QueueChannel.Cleanup,
    jobName: JobChannel.DeepCleanup,
    data: {
        type: 'deep-cleanup',
        maxAge: 86400 * 7, // 7 days in seconds
    },
    options: {
        attempts: 3,
        removeOnComplete: {
            age: 86400, // Keep completed jobs for 24 hours
        },
    },
    enabled: true,
};

/**
 * Start cleanup scheduled jobs
 */
export const startCleanupJobs = (): void => {
    schedulerService.scheduleJobs([hourlyCleanupJob, dailyDeepCleanupJob]);
};

export default startCleanupJobs;
