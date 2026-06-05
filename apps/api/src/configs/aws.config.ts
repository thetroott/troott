import { S3Client } from '@aws-sdk/client-s3';
import { ENVType } from '@/types/common.enum';
import { AWSConfig } from '@/interfaces/common.interface';

let config: AWSConfig;

switch (process.env.NODE_ENV) {
  case ENVType.PRODUCTION:
    config = {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,

      originalsBucket: process.env.AWS_ORIGINALS_BUCKET!,
      playbackBucket: process.env.AWS_PLAYBACK_BUCKET!,
      storageBucket: process.env.AWS_STORAGE_BUCKET!,
    };

    break;

  case ENVType.STAGING:
    config = {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,

      originalsBucket: process.env.AWS_BUCKET_STAGING!,
      playbackBucket: process.env.AWS_BUCKET_STAGING!,
      storageBucket: process.env.AWS_BUCKET_STAGING!,
    };

    break;

  case ENVType.DEVELOPMENT:
    config = {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,

      originalsBucket: process.env.AWS_BUCKET_DEVELOPMENT!,
      playbackBucket: process.env.AWS_BUCKET_DEVELOPMENT!,
      storageBucket: process.env.AWS_BUCKET_DEVELOPMENT!,
    };

    break;

  default:
    throw new Error("Invalid NODE_ENV. AWS config not set.");
}

export const s3 = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});


export const AWS_BUCKETS_ORIGINALS = config.originalsBucket;
export const AWS_BUCKETS_PLAYBACK = config.playbackBucket;
export const AWS_BUCKETS_STORAGE = config.storageBucket;