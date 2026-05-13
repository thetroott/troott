import { Job, DoneCallback } from 'bull';
import { IEmailJob, IResult } from '@/interfaces/common.interface';
import logger from '../../utils/logger.util';
import emailService from '@/services/email.service';

/**
 * @name emailProcessor
 * @description The core function that the Bull worker executes for each 'emails:send' job.
 * It uses the AppEmailService to dispatch the email and uses the 'done' callback to signal completion.
 * @param job The Bull job object containing the email data
 * @param done The Bull done callback function
 */
const emailProcessor = async (job: Job<IEmailJob>, done: DoneCallback) => {
    const email = job.data.user?.email;
    const template = job.data.template;

    logger.log({
        data: `Processing Email Job ID: ${job.id}, Recipient: ${email}, Template: ${template}`,
        label: 'email-processor',
        type: 'info',
    });

    try {
        // The data passed to the worker is the IEmailJob structure,
        // which matches the SendEmailDTO structure required by AppEmailService.sendEmail.
        const result: IResult = await emailService.sendEmail(job.data);

        if (result.error) {
            // Log error and call done(error) to signal Bull to retry the job
            // (if attempts are configured in the original addJob call).
            logger.log({
                data: `Failed to process Email Job ID: ${job.id}. Error: ${result.message}`,
                label: 'email-processor',
                type: 'error',
            });

            return done(new Error(result.message));
        }

        logger.log({
            data: `Successfully processed Email Job ID: ${job.id} for ${email}`,
            label: 'email-processor',
            type: 'success',
        });

        // Success: Call done(null, result) to mark the job as completed successfully
        done(null, result);
    } catch (error) {
        // Catch any critical errors during processing (e.g., connection issue)
        logger.log({
            data: `Critical error during processing of Job ID: ${job.id}. Error: ${error instanceof Error ? error.message : String(error)}`,
            label: 'email-processor-critical',
            type: 'error',
        });

        // Signal Bull that the job failed
        done(error as Error);
    }
};

export default emailProcessor;
