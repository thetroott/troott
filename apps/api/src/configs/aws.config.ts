import { S3Client } from '@aws-sdk/client-s3';
import { ENVType } from '@/types/common.enum';
import { AWSConfig } from '@/interfaces/common.interface';

function splitBucketEnv(name: string | undefined): string | undefined {
    const v = name?.trim();
    return v && v.length > 0 ? v : undefined;
}

function withSplitBuckets(base: Omit<AWSConfig, 'originalsBucket' | 'playbackBucket' | 'storageBucket'>): AWSConfig {
    return {
        ...base,
        originalsBucket:
            splitBucketEnv(process.env.AWS_ORIGINALS_BUCKET) ?? base.bucketName,
        playbackBucket:
            splitBucketEnv(process.env.AWS_PLAYBACK_BUCKET) ?? base.bucketName,
        storageBucket:
            splitBucketEnv(process.env.AWS_STORAGE_BUCKET) ?? base.bucketName,
    };
}

let config: AWSConfig;

switch (process.env.NODE_ENV) {
    case ENVType.PRODUCTION:
        config = withSplitBuckets({
            region: process.env.AWS_REGION!,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            bucketName: process.env.AWS_BUCKET_NAME!,
        });

        break;

    case ENVType.STAGING:
        config = withSplitBuckets({
            region: process.env.AWS_REGION!,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            bucketName: process.env.AWS_STAGING_BUCKET_NAME!,
        });

        break;

    case ENVType.DEVELOPMENT:
        config = withSplitBuckets({
            region: process.env.AWS_REGION!,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            bucketName: process.env.AWS_DEV_BUCKET_NAME!,
        });

        break;

    case 'test':
        config = withSplitBuckets({
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
            bucketName:
                process.env.AWS_DEV_BUCKET_NAME ||
                process.env.AWS_BUCKET_NAME ||
                'test-bucket',
        });
        break;

    default:
        throw new Error('Invalid NODE_ENV. AWS config not set.');
}

export const s3 = new S3Client({
    region: config.region,
    credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
    },
});

export const AWS_BUCKET_NAME = config.bucketName;
