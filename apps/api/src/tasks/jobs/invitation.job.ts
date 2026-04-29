import { Job, DoneCallback } from 'bull';
import logger from '../../utils/logger.util';
import Invites from '../../modules/platform/Invitation/invitation.model';
import { InvitationStatus } from '../../modules/platform/Invitation/invitation.interface';

/**
 * Process invitation job
 * This is the worker function that processes invitation-related jobs from the queue
 * Follows the Bull pattern with Job and DoneCallback
 */
const processInvitationJob = async (
    job: Job,
    done: DoneCallback,
): Promise<void> => {
    const { type } = job.data;

    logger.log({
        data: `Processing invitation job: ${type}`,
        label: 'invitation-job',
        type: 'info',
    });

    try {
        let result: any = { type, processedCount: 0 };

        if (type === 'mark-expired') {
            // Find all pending invitations that have expired
            const now = new Date();
            const expiredInvitations = await Invites.updateMany(
                {
                    inviteStatus: InvitationStatus.PENDING,
                    expiresAt: { $lt: now }, // expiresAt is less than current time
                },
                {
                    $set: {
                        inviteStatus: InvitationStatus.EXPIRED,
                    },
                },
            );

            result.processedCount = expiredInvitations.modifiedCount;

            logger.log({
                data: `Marked ${expiredInvitations.modifiedCount} invitations as expired`,
                label: 'invitation-job',
                type: 'success',
            });
        } else {
            logger.log({
                data: `Unknown invitation job type: ${type}`,
                label: 'invitation-job',
                type: 'warning',
            });
            result.error = `Unknown job type: ${type}`;
        }

        logger.log({
            data: `Invitation job ${job.id} completed successfully`,
            label: 'invitation-job',
            type: 'success',
        });

        // Success: Call done(null, result) to mark the job as completed successfully
        done(null, result);
    } catch (error) {
        logger.log({
            data: `Invitation job ${job.id} failed: ${
                error instanceof Error ? error.message : String(error)
            }`,
            label: 'invitation-job',
            type: 'error',
        });

        // Signal Bull that the job failed
        done(error as Error);
    }
};

export default processInvitationJob;
