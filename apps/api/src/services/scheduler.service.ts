import * as cron from 'node-cron';
import { Queue, JobOptions } from 'bull';
import logger from '../utils/logger.util';
import BullQueue from '../queues/queue';

/**
 * Scheduled Job Configuration
 */
export interface ScheduledJobConfig {
    name: string; // Unique job name
    cronPattern: string; // Cron expression (e.g., '0 0 * * *' for daily at midnight)
    queueName: string; // Queue name to add the job to
    jobName: string; // Job name within the queue
    data?: any; // Job data payload
    options?: JobOptions; // Bull job options
    timezone?: string; // Timezone (e.g., 'America/New_York')
    enabled?: boolean; // Whether the job is enabled (default: true)
}

/**
 * Scheduler Service
 * Manages cron-based scheduled jobs using Bull
 */
class SchedulerService {
    private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
    private queues: Map<string, Queue> = new Map();

    constructor() {}

    /**
     * @name scheduleJob
     * Schedule a recurring job using cron pattern
     */
    public scheduleJob(config: ScheduledJobConfig): void {
        const {
            name,
            cronPattern,
            queueName,
            jobName,
            data = {},
            options = {},
            timezone,
            enabled = true,
        } = config;

        // Validate cron pattern
        if (!cron.validate(cronPattern)) {
            logger.log({
                data: `Invalid cron pattern '${cronPattern}' for job '${name}'`,
                label: 'Scheduler',
                type: 'error',
            });
            return;
        }

        // Skip if disabled
        if (!enabled) {
            logger.log({
                data: `Job '${name}' is disabled, skipping schedule`,
                label: 'Scheduler',
                type: 'info',
            });
            return;
        }

        // Create cron task
        const taskOptions = timezone ? { timezone } : undefined;

        const task = cron.schedule(
            cronPattern,
            async () => {
                try {
                    // Ensure queue exists (create if needed)
                    let queue = this.queues.get(queueName);
                    if (!queue) {
                        queue = await BullQueue.createQueue({
                            name: queueName,
                        });
                        this.queues.set(queueName, queue);
                    }

                    await queue.add(jobName, data, {
                        ...options,
                        jobId: options?.jobId || `${name}-${Date.now()}`,
                    });

                    logger.log({
                        data: `Scheduled job '${name}' executed and added to queue '${queueName}'`,
                        label: 'Scheduler',
                        type: 'success',
                    });
                } catch (error) {
                    logger.log({
                        data: `Failed to execute scheduled job '${name}': ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`,
                        label: 'Scheduler',
                        type: 'error',
                    });
                }
            },
            taskOptions,
        );

        this.scheduledTasks.set(name, task);

        logger.log({
            data: `Scheduled job '${name}' with pattern '${cronPattern}' on queue '${queueName}'`,
            label: 'Scheduler',
            type: 'success',
        });
    }

    /**
     * @name scheduleJobs
     * Schedule multiple jobs at once
     */
    public scheduleJobs(configs: ScheduledJobConfig[]): void {
        configs.forEach((config) => this.scheduleJob(config));
    }

    /**
     * @name unscheduleJob
     * Remove a scheduled job
     */
    public unscheduleJob(name: string): void {
        const task = this.scheduledTasks.get(name);
        if (task) {
            task.stop();
            this.scheduledTasks.delete(name);
            logger.log({
                data: `Unscheduled job '${name}'`,
                label: 'Scheduler',
                type: 'info',
            });
        }
    }

    /**
     * @name getScheduledJobs
     * Get list of all scheduled job names
     */
    public getScheduledJobs(): string[] {
        return Array.from(this.scheduledTasks.keys());
    }

    /**
     * @name stopAll
     * Stop all scheduled jobs
     */
    public stopAll(): void {
        this.scheduledTasks.forEach((task, name) => {
            task.stop();
            logger.log({
                data: `Stopped scheduled job '${name}'`,
                label: 'Scheduler',
                type: 'info',
            });
        });
        this.scheduledTasks.clear();
    }

    /**
     * @name getQueue
     * Get a queue instance by name
     */
    public getQueue(name: string): Queue | undefined {
        return this.queues.get(name);
    }

    /**
     * @name closeAllQueues
     * Close all queues (used during shutdown)
     */
    public async closeAllQueues(): Promise<void> {
        const closePromises = Array.from(this.queues.keys()).map((name) =>
            BullQueue.closeQueue(name),
        );
        await Promise.all(closePromises);
        this.queues.clear();
    }
}

export default new SchedulerService();
