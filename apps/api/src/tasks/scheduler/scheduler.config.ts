import { ScheduledJobConfig } from '@/services/scheduler.service';
import startReminderJobs from './reminder';
import startCleanupJobs from './tmp-cleanup';
import startMarketingJobs from './marketing.schedular';
import startInvitationJobs from './invitation.schedular';

/**
 * Scheduler Configuration
 * Central configuration for all scheduled jobs
 */

/**
 * Get all scheduled job configurations
 * This can be used to programmatically manage jobs
 */
export const getAllScheduledJobConfigs = (): ScheduledJobConfig[] => {
    // Return all job configurations
    // This is useful for dynamic job management
    return [];
};

/**
 * Start all scheduled jobs
 * Call this function during application startup
 */
export const startScheduledJobs = (): void => {
    // Start reminder jobs
    startReminderJobs();

    // Start cleanup jobs
    startCleanupJobs();

    // Start marketing jobs
    startMarketingJobs();

    // Start invitation jobs
    startInvitationJobs();

    // Add more job starters here as needed
};

export default startScheduledJobs;
