import schedulerService from '@/services/scheduler.service';
import { ScheduledJobConfig } from '@/services/scheduler.service';
import { QueueChannel, JobChannel } from '../../queues/channel.queue';
import {
    CronPatterns,
    CronPatternBuilder,
    DayOfWeek,
} from '../cron/cron.patterns';

/**
 * Reminder Scheduled Jobs
 * Define all reminder-related scheduled jobs here
 *
 * Cron pattern format: "* * * * *"
 *  | | | | |
 *  | | | | └─── day of week (0-7, where 0 and 7 are Sunday)
 *  | | | └───── month (1-12)
 *  | | └─────── day of month (1-31)
 *  | └───────── hour (0-23)
 *  └─────────── minute (0-59)
 */

// Daily reminder job at 9 AM
const dailyReminderJob: ScheduledJobConfig = {
    name: 'daily-reminder',
    cronPattern: CronPatterns.DAILY_9AM, // Every day at 9:00 AM
    queueName: QueueChannel.Reminders,
    jobName: JobChannel.SendDailyReminder,
    data: {
        type: 'daily',
        message: 'Daily reminder notification',
    },
    options: {
        attempts: 3,
        removeOnComplete: {
            age: 86400, // Keep completed jobs for 24 hours
        },
    },
    enabled: true,
};

// Weekly reminder job every Monday at 8 AM
const weeklyReminderJob: ScheduledJobConfig = {
    name: 'weekly-reminder',
    cronPattern: CronPatterns.WEEKLY_MONDAY_8AM, // Every Monday at 8:00 AM
    queueName: QueueChannel.Reminders,
    jobName: JobChannel.SendWeeklyReminder,
    data: {
        type: 'weekly',
        message: 'Weekly reminder notification',
    },
    options: {
        attempts: 3,
    },
    enabled: true,
};

/**
 * Start reminder scheduled jobs
 */
export const startReminderJobs = (): void => {
    schedulerService.scheduleJobs([dailyReminderJob, weeklyReminderJob]);
};

export default startReminderJobs;
