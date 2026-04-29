import { Job, DoneCallback } from 'bull';
import logger from '../../utils/logger.util';

/**
 * Scheduled marketing jobs (Bull worker entry).
 * Hackathon / workspace campaigns were removed for the sermon-streaming product.
 */
const processMarketingJob = async (
    job: Job,
    done: DoneCallback,
): Promise<void> => {
    const { type, message } = job.data || {};

    logger.log({
        data: `Marketing job skipped (no-op): ${type} - ${message ?? ''}`,
        label: 'marketing-job',
        type: 'info',
    });

    done(null, { success: true, type, message, skipped: true });
};

export default processMarketingJob;
