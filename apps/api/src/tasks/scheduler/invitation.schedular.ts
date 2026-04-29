import schedulerService from '../../modules/internals/scheduler/scheduler.service';
import { ScheduledJobConfig } from '../../modules/internals/scheduler/scheduler.service';
import { QueueChannel, JobChannel } from '../../queues/channel.queue';
import { CronPatterns } from '../cron/cron.patterns';

/**
 * Invitation Scheduled Jobs
 * Define all invitation-related scheduled jobs here
 *
 * Cron pattern format: "* * * * *"
 *  | | | | |
 *  | | | | └─── day of week (0-7, where 0 and 7 are Sunday)
 *  | | | └───── month (1-12)
 *  | | └─────── day of month (1-31)
 *  | └───────── hour (0-23)
 *  └─────────── minute (0-59)
 */

// Mark expired invitations every hour
// This checks for pending invitations that have passed their expiration date
const markExpiredInvitationsJob: ScheduledJobConfig = {
    name: 'mark-expired-invitations',
    cronPattern: CronPatterns.EVERY_HOUR, // Every hour at minute 0
    queueName: QueueChannel.Invitations,
    jobName: JobChannel.MarkExpiredInvitations,
    data: {
        type: 'mark-expired',
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
 * Start invitation scheduled jobs
 */
export const startInvitationJobs = (): void => {
    schedulerService.scheduleJobs([markExpiredInvitationsJob]);
};

export default startInvitationJobs;
