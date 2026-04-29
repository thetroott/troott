import { IEmailJob } from '../utils/interfaces.util';
import { JobOptions } from 'bull';

/**
 * DTO for creating a new queue
 */
export interface CreateQueueDTO {
    name: string; // Queue name
}

/**
 * DTO for creating a worker/processor
 */
export interface CreateWorkerDTO {
    queueName: string; // Which queue to attach worker to
    jobName: string; // The name of the job being processed
    concurrency?: number; // Number of jobs processed in parallel (default: 1)
}

// Used by the first 'addJob' function for a single job
export interface AddJobDTO {
    // The name of the queue (e.g., 'email_queue', 'notification_queue')
    queueName: string;

    // The name of the specific job type within that queue (e.g., 'send_welcome_email')
    jobName: string;

    // The data payload for the worker to process
    data: any;

    // Optional Bull job options (attempts, delay, priority, jobId, etc.)
    options?: JobOptions;
}

// Used by the second 'addJob' function for a bulk operation
export interface AddJobsDTO {
    // The name of the queue (e.g., 'email_queue', 'notification_queue')
    queueName: string;

    // An array containing the details for all jobs to be added
    jobs: JobDataDTO[];
}

// Sub-DTO for individual job details within the array
export interface JobDataDTO {
    // The name of the specific job type (e.g., 'send_welcome_email')
    name: string;

    // The data payload for the worker to process
    data: any | IEmailJob;

    // Optional Bull job options for this specific job
    options?: JobOptions;
}
