export const S3_MULTIPART_THRESHOLD_BYTES = 6 * 1024 * 1024;
export const S3_MULTIPART_PART_SIZE_BYTES = 6 * 1024 * 1024;
export const S3_MULTIPART_PRESIGN_EXPIRY_SEC = 3600;

/** Max size for storage multipart (cover, KYC, profile). */
export const S3_STORAGE_MULTIPART_MAX_BYTES = 100 * 1024 * 1024;

export const S3_SERMON_AUDIO_MAX_BYTES =
    Number(process.env.SERMON_AUDIO_MAX_BYTES) || 512 * 1024 * 1024;

/** Mongo TTL on `S3MultipartSession`. */
export const S3_MULTIPART_SESSION_EXPIRY_HOURS = 24;

/** Reserved for future sign-part rate limiting (not wired yet). */
export const S3_MULTIPART_SIGN_RATE_LIMIT_PER_HOUR = 2000;

export const S3_MULTIPART_SESSION_CLEANUP_GRACE_MS = 2 * 60 * 60 * 1000;
