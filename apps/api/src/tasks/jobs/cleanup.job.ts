import { Job, DoneCallback } from 'bull';
import logger from '../../utils/logger.util';
import * as fs from 'fs/promises';
import * as path from 'path';
import S3MultipartSession from '@/models/s3-multipart-session.model';
import {
    S3_MULTIPART_SESSION_CLEANUP_GRACE_MS,
    S3_MULTIPART_SESSION_EXPIRY_HOURS,
} from '@/configs/s3-multipart.config';
import { abortS3MultipartOnAws } from '@/controllers/s3-multipart.storage.controller';

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

        if (type === 's3-multipart-sessions') {
            const cutoff = new Date(
                Date.now() -
                    S3_MULTIPART_SESSION_EXPIRY_HOURS * 3600 * 1000,
            );
            const graceCutoff = new Date(
                Date.now() - S3_MULTIPART_SESSION_CLEANUP_GRACE_MS,
            );

            const stale = await S3MultipartSession.find({
                finalized: false,
                status: { $ne: 'aborted' },
                createdAt: { $lt: cutoff },
                updatedAt: { $lt: graceCutoff },
            }).lean();

            let cleanedCount = 0;
            for (const session of stale) {
                try {
                    await abortS3MultipartOnAws(session);
                    await S3MultipartSession.updateOne(
                        { sessionId: session.sessionId },
                        { status: 'aborted' },
                    );
                    cleanedCount++;
                    logger.log({
                        data: `event=s3-multipart-cleanup sessionId=${session.sessionId} key=${session.s3Key}`,
                        label: 'cleanup-job',
                        type: 'info',
                    });
                } catch {
                    /* skip */
                }
            }
            result.cleanedCount = cleanedCount;
        } else if (type === 'temp-files') {
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
