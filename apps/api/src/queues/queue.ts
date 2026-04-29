import Bull, { QueueOptions, Queue, Job, DoneCallback } from 'bull';
import logger from '../utils/logger.util';
import { ENV } from '../utils/env.util';
import {
    AddJobsDTO,
    CreateQueueDTO,
    CreateWorkerDTO,
    JobDataDTO,
} from './queue.dto';
import { REDIS_CONFIG } from '../configs/redis.config';

class BullQueue {
    // A map to store active queue instances by name
    private queues: Map<string, Queue> = new Map();

    constructor() {}

    /**
     * @name createQueue
     * @param data
     * @returns
     */
    public async createQueue(data: CreateQueueDTO): Promise<Queue> {
        const { name } = data;

        // If queue already exists, return the existing instance
        if (this.queues.has(name)) {
            return this.queues.get(name)!;
        }

        const options: QueueOptions = {
            redis: {
                host: REDIS_CONFIG.host,
                port: REDIS_CONFIG.port,
                password: REDIS_CONFIG.password,
                username: REDIS_CONFIG.user,
                db: REDIS_CONFIG.db,
                connectTimeout: 30000,

                // maxRetriesPerRequest: null,
                // enableReadyCheck: false,
                // tls: {
                //     rejectUnauthorized:
                //         REDIS_CONFIG.tls.rejectUnauthorized,
                //     minVersion: "TLSv1.2",
                // },
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        };

        logger.log({
            data: `Bull connecting to: ${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`,
            label: 'Redis-Bull-Config',
            type: 'info',
        });

        const newQueue = new Bull(`${name}`, options);
        this.queues.set(name, newQueue);

        return newQueue;
    }

    /**
     * @name addProcessor
     * @param data
     */
    public async addProcessor(
        data: CreateWorkerDTO,
        callback: (data: Job<JobDataDTO>, done: DoneCallback) => Promise<void>,
    ): Promise<Queue> {
        const { queueName, jobName, concurrency = 10 } = data;

        const queue = await this.createQueue({ name: queueName });

        // Process jobs with concurrency (e.g., 1 for sequential processing, or more for parallel)
        // Default concurrency is 1
        queue.process(jobName, concurrency, callback);

        // completed
        queue.on('completed', (job) => {
            if (ENV.isDevelopment() || ENV.isStaging()) {
                let message = `job with the id: ${job.id} completed`;
                logger.log({
                    data: message,
                    label: 'job-queue',
                    type: 'success',
                });
            }
        });

        // failed
        queue.on('failed', (job, err) => {
            if (ENV.isDevelopment() || ENV.isStaging()) {
                let message = `Job with id: ${job.id} failed for queue: ${queue.name} with error: ${err.message}`;
                logger.log({
                    data: message,
                    label: 'job-queue',
                    type: 'error',
                });
            }
        });

        // error
        queue.on('error', (err) => {
            logger.log({
                data: `Queue '${queue.name}' experienced an error: ${
                    err?.message || err
                }`,
                label: 'job-queue',
                type: 'error',
            });
        });

        return queue;
    }

    /**
     * @name addJobs
     * @param queue
     * @param jobs
     */
    public async addJobs(data: AddJobsDTO): Promise<void> {
        const { queueName, jobs } = data;

        const queue = await this.createQueue({ name: queueName });

        const bulkJobs = jobs.map((job) => ({
            name: job.name,
            data: job.data,
            opts: job.options,
        }));

        // add all jobs
        await queue.addBulk(bulkJobs);

        // log add jobs
        const jobIds = bulkJobs
            .map((job) => job.opts?.jobId || 'N/A')
            .join(', ');
        logger.log({
            data: `Added ${jobs.length} jobs to queue '${queue.name}'. Job IDs: ${jobIds}`,
            label: 'BullMQueue',
            type: 'info',
        });
    }

    /**
     * @name getQueue
     * @param name The name of the queue to retrieve.
     * @returns The Queue instance, or undefined if not found.
     */
    public getQueue(name: string): Queue | undefined {
        return this.queues.get(name);
    }

    /**
     * @name closeQueue
     * @param name
     */
    public async closeQueue(name: string): Promise<void> {
        const queue = this.queues.get(name);

        if (!queue) return;

        await queue.close();
        this.queues.delete(name);

        logger.log({
            data: `Closed queue '${name}'`,
            label: 'BullMQueue',
            type: 'info',
        });
    }
}

export default new BullQueue();
