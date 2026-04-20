import { Job, DoneCallback } from 'bull';
import logger from '../../utils/logger.util';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Process cleanup job
 * This is the worker function that processes cleanup jobs from the queue
 * Follows the Bull pattern with Job and DoneCallback
 */
const processCleanupJob = async (
    job: Job,
    done: DoneCallback,
): Promise<void> => {
    const { type, maxAge } = job.data;

    logger.log({
        data: `Processing cleanup job: ${type} with maxAge: ${maxAge}s`,
        label: 'cleanup-job',
        type: 'info',
    });

    try {
        let result: any = { type, cleanedCount: 0 };

        if (type === 'temp-files') {
            // TODO: Implement temporary file cleanup logic
            // Example: Clean up files older than maxAge in temp directory
            const tempDir = path.join(process.cwd(), 'tmp');

            try {
                const files = await fs.readdir(tempDir);
                const now = Date.now();
                let cleanedCount = 0;

                for (const file of files) {
                    const filePath = path.join(tempDir, file);
                    const stats = await fs.stat(filePath);
                    const age = (now - stats.mtime.getTime()) / 1000; // Age in seconds

                    if (age > maxAge) {
                        await fs.unlink(filePath);
                        cleanedCount++;
                    }
                }

                result.cleanedCount = cleanedCount;
                logger.log({
                    data: `Cleaned up ${cleanedCount} temporary files`,
                    label: 'cleanup-job',
                    type: 'success',
                });
            } catch (error) {
                // Directory might not exist, which is fine
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    throw error;
                }
            }
        } else if (type === 'deep-cleanup') {
            // TODO: Implement deep cleanup logic
            // Example: Clean up old database records, expired sessions, etc.
            logger.log({
                data: 'Deep cleanup completed',
                label: 'cleanup-job',
                type: 'success',
            });
        }

        logger.log({
            data: `Cleanup job ${job.id} completed successfully`,
            label: 'cleanup-job',
            type: 'success',
        });

        // Success: Call done(null, result) to mark the job as completed successfully
        done(null, result);
    } catch (error) {
        logger.log({
            data: `Cleanup job ${job.id} failed: ${
                error instanceof Error ? error.message : String(error)
            }`,
            label: 'cleanup-job',
            type: 'error',
        });

        // Signal Bull that the job failed
        done(error as Error);
    }
};

export default processCleanupJob;
