import { Job, DoneCallback } from 'bull';

/**
 * Legacy placeholder for MPEG-DASH packaging — **not wired** in v1 (HLS-only).
 * Kept so imports remain valid; enabling DASH requires a full processor rewrite.
 */
const audioDASHProcessorDisabled = async (
    job: Job<unknown>,
    done: DoneCallback,
) => {
    done(
        new Error(
            `MPEG-DASH job ${job.id} ignored: v1 ships HLS only (see audio-processing.job).`,
        ),
    );
};

export default audioDASHProcessorDisabled;
