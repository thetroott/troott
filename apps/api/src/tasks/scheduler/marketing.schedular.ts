import schedulerService from '@/services/scheduler.service';
import { ScheduledJobConfig } from '@/services/scheduler.service';
import { QueueChannel, JobChannel } from '../../queues/channel.queue';
import { CronPatterns } from '../cron/cron.patterns';

/**
 * Marketing Scheduled Jobs
 * Define all marketing-related scheduled jobs here
 *
 * Cron pattern format: "* * * * *"
 *  | | | | |
 *  | | | | └─── day of week (0-7, where 0 and 7 are Sunday)
 *  | | | └───── month (1-12)
 *  | | └─────── day of month (1-31)
 *  | └───────── hour (0-23)
 *  └─────────── minute (0-59)
 */

// Weekly marketing email for hackathons happening this week
// Every Monday at 8:00 AM UTC
const hackathonsThisWeekJob: ScheduledJobConfig = {
    name: 'hackathons-this-week-marketing',
    cronPattern: CronPatterns.WEEKLY_MONDAY_8AM, // Every Monday at 8:00 AM
    queueName: QueueChannel.Marketing,
    jobName: JobChannel.SendHackathonsThisWeek,
    data: {
        type: 'hackathons-this-week',
        message: 'Weekly hackathons marketing email',
    },
    options: {
        attempts: 3,
        removeOnComplete: {
            age: 86400, // Keep completed jobs for 24 hours
        },
    },
    timezone: 'UTC', // Ensure it runs at 8 AM UTC
    enabled: true,
};

/**
 * Start marketing scheduled jobs
 */
export const startMarketingJobs = (): void => {
    schedulerService.scheduleJobs([hackathonsThisWeekJob]);
};

export default startMarketingJobs;
