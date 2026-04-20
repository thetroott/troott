/**
 * Cron Pattern Utility
 *
 * Cron pattern format: "* * * * *"
 *  | | | | |
 *  | | | | └─── day of week (0-7, where 0 and 7 are Sunday)
 *  | | | └───── month (1-12)
 *  | | └─────── day of month (1-31)
 *  | └───────── hour (0-23)
 *  └─────────── minute (0-59)
 *
 * Special characters:
 *  * = any value
 *  , = value list separator
 *  - = range of values
 *  / = step values
 */

/**
 * Common Cron Patterns
 */
export const CronPatterns = {
    // Every minute
    EVERY_MINUTE: '* * * * *',

    // Every 5 minutes
    EVERY_5_MINUTES: '*/5 * * * *',

    // Every 10 minutes
    EVERY_10_MINUTES: '*/10 * * * *',

    // Every 15 minutes
    EVERY_15_MINUTES: '*/15 * * * *',

    // Every 30 minutes
    EVERY_30_MINUTES: '*/30 * * * *',

    // Every hour (at minute 0)
    EVERY_HOUR: '0 * * * *',

    // Every 6 hours
    EVERY_6_HOURS: '0 */6 * * *',

    // Every 12 hours
    EVERY_12_HOURS: '0 */12 * * *',

    // Daily at midnight (00:00)
    DAILY_MIDNIGHT: '0 0 * * *',

    // Daily at 1 AM
    DAILY_1AM: '0 1 * * *',

    // Daily at 2 AM
    DAILY_2AM: '0 2 * * *',

    // Daily at 3 AM
    DAILY_3AM: '0 3 * * *',

    // Daily at 6 AM
    DAILY_6AM: '0 6 * * *',

    // Daily at 8 AM
    DAILY_8AM: '0 8 * * *',

    // Daily at 9 AM
    DAILY_9AM: '0 9 * * *',

    // Daily at 12 PM (noon)
    DAILY_NOON: '0 12 * * *',

    // Daily at 6 PM
    DAILY_6PM: '0 18 * * *',

    // Daily at 9 PM
    DAILY_9PM: '0 21 * * *',

    // Daily at 11 PM
    DAILY_11PM: '0 23 * * *',

    // Weekly on Sunday at midnight
    WEEKLY_SUNDAY: '0 0 * * 0',

    // Weekly on Monday at midnight
    WEEKLY_MONDAY: '0 0 * * 1',

    // Weekly on Monday at 8 AM
    WEEKLY_MONDAY_8AM: '0 8 * * 1',

    // Weekly on Tuesday at midnight
    WEEKLY_TUESDAY: '0 0 * * 2',

    // Weekly on Wednesday at midnight
    WEEKLY_WEDNESDAY: '0 0 * * 3',

    // Weekly on Thursday at midnight
    WEEKLY_THURSDAY: '0 0 * * 4',

    // Weekly on Friday at midnight
    WEEKLY_FRIDAY: '0 0 * * 5',

    // Weekly on Saturday at midnight
    WEEKLY_SATURDAY: '0 0 * * 6',

    // Monthly on the 1st at midnight
    MONTHLY_1ST: '0 0 1 * *',

    // Monthly on the 15th at midnight
    MONTHLY_15TH: '0 0 15 * *',

    // Monthly on the last day at midnight
    MONTHLY_LAST_DAY: '0 0 L * *',

    // Yearly on January 1st at midnight
    YEARLY_JAN_1ST: '0 0 1 1 *',

    // Every weekday (Monday-Friday) at 9 AM
    WEEKDAYS_9AM: '0 9 * * 1-5',

    // Every weekday at 5 PM
    WEEKDAYS_5PM: '0 17 * * 1-5',

    // Every weekend (Saturday-Sunday) at 10 AM
    WEEKENDS_10AM: '0 10 * * 0,6',
} as const;

/**
 * Helper function to create custom cron patterns
 */
export class CronPatternBuilder {
    /**
     * Create a pattern for a specific time
     * @param minute - Minute (0-59)
     * @param hour - Hour (0-23)
     * @param dayOfMonth - Day of month (1-31) or '*' for any
     * @param month - Month (1-12) or '*' for any
     * @param dayOfWeek - Day of week (0-7, 0/7=Sunday) or '*' for any
     */
    static atTime(
        minute: number | string = '*',
        hour: number | string = '*',
        dayOfMonth: number | string = '*',
        month: number | string = '*',
        dayOfWeek: number | string = '*',
    ): string {
        return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    }

    /**
     * Create a pattern for every N minutes
     */
    static everyNMinutes(n: number): string {
        return `*/${n} * * * *`;
    }

    /**
     * Create a pattern for every N hours
     */
    static everyNHours(n: number, minute: number = 0): string {
        return `${minute} */${n} * * *`;
    }

    /**
     * Create a pattern for daily at a specific time
     */
    static dailyAt(hour: number, minute: number = 0): string {
        return `${minute} ${hour} * * *`;
    }

    /**
     * Create a pattern for weekly on a specific day and time
     * @param dayOfWeek - 0 (Sunday) to 6 (Saturday)
     * @param hour - Hour (0-23)
     * @param minute - Minute (0-59)
     */
    static weeklyOn(
        dayOfWeek: number,
        hour: number = 0,
        minute: number = 0,
    ): string {
        return `${minute} ${hour} * * ${dayOfWeek}`;
    }

    /**
     * Create a pattern for monthly on a specific day and time
     */
    static monthlyOn(
        dayOfMonth: number,
        hour: number = 0,
        minute: number = 0,
    ): string {
        return `${minute} ${hour} ${dayOfMonth} * *`;
    }

    /**
     * Create a pattern for weekdays at a specific time
     */
    static weekdaysAt(hour: number, minute: number = 0): string {
        return `${minute} ${hour} * * 1-5`;
    }

    /**
     * Create a pattern for weekends at a specific time
     */
    static weekendsAt(hour: number, minute: number = 0): string {
        return `${minute} ${hour} * * 0,6`;
    }
}

/**
 * Day of Week Constants
 */
export const DayOfWeek = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
} as const;

/**
 * Month Constants
 */
export const Month = {
    JANUARY: 1,
    FEBRUARY: 2,
    MARCH: 3,
    APRIL: 4,
    MAY: 5,
    JUNE: 6,
    JULY: 7,
    AUGUST: 8,
    SEPTEMBER: 9,
    OCTOBER: 10,
    NOVEMBER: 11,
    DECEMBER: 12,
} as const;

export default CronPatterns;
