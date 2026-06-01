import { AWS_BUCKET_NAME } from './aws.config';

export type S3BucketRole = 'originals' | 'playback' | 'storage';

function envBucket(name: string | undefined): string | undefined {
    const v = name?.trim();
    return v && v.length > 0 ? v : undefined;
}

const originalsBucket =
    envBucket(process.env.AWS_ORIGINALS_BUCKET) ?? AWS_BUCKET_NAME;
const playbackBucket =
    envBucket(process.env.AWS_PLAYBACK_BUCKET) ?? AWS_BUCKET_NAME;
const storageBucket =
    envBucket(process.env.AWS_STORAGE_BUCKET) ?? AWS_BUCKET_NAME;

/** Resolve S3 bucket name for sermon originals, HLS playback, or general storage. */
export function bucketNameFor(role: S3BucketRole): string {
    switch (role) {
        case 'originals':
            return originalsBucket;
        case 'playback':
            return playbackBucket;
        case 'storage':
            return storageBucket;
        default:
            return AWS_BUCKET_NAME;
    }
}

/**
 * Infer bucket role from object key when callers pass a full s3Key only.
 * Playback keys: `{uploadId}/hls/...` (no `audio/` prefix).
 */
export function inferBucketRoleFromKey(key: string): S3BucketRole {
    const normalized = key.replace(/^\/+/, '');
    if (normalized.startsWith('audio/')) {
        return 'originals';
    }
    if (/\/hls\//.test(normalized) || normalized.endsWith('/hls/master.m3u8')) {
        return 'playback';
    }
    return 'storage';
}

export const s3BucketsConfig = {
    originalsBucket,
    playbackBucket,
    storageBucket,
    usesSplitBuckets:
        originalsBucket !== playbackBucket ||
        playbackBucket !== storageBucket ||
        Boolean(
            process.env.AWS_ORIGINALS_BUCKET ||
                process.env.AWS_PLAYBACK_BUCKET ||
                process.env.AWS_STORAGE_BUCKET,
        ),
} as const;
