/**
 * Sermon audio ingest + streaming delivery configuration.
 * CDN base should match the hostname clients use for HLS (manifest + segments).
 */
import { bucketNameFor } from './s3-buckets.config';

const mb = (n: number) => n * 1024 * 1024;

/** HTTPS URL for an object when bucket allows public read OR behind CDN origin mapping to bucket. */
export function publicHttpsUrlForS3Key(key: string): string {
    const region = process.env.AWS_REGION || 'us-east-1';
    const bucket = bucketNameFor('playback');
    const encoded = key.split('/').map(encodeURIComponent).join('/');
    return `https://${bucket}.s3.${region}.amazonaws.com/${encoded}`;
}

/** Derive playable base URL for packaged media (prefer CDN, then optional HTTP origin). */
export function mediaPublicBaseUrl(): string {
    const cdn = (process.env.MEDIA_CDN_BASE_URL || '').replace(/\/$/, '');
    if (cdn) return cdn;
    return process.env.S3_PUBLIC_HTTP_BASE?.replace(/\/$/, '') || '';
}

export function urlForMediaKey(s3Key: string): string {
    const base = mediaPublicBaseUrl();
    if (base) {
        return `${base}/${s3Key.split('/').map(encodeURIComponent).join('/')}`;
    }
    return publicHttpsUrlForS3Key(s3Key);
}

function defaultHlsWorkerConcurrency(): number {
    const raw = process.env.AUDIO_HLS_WORKER_CONCURRENCY?.trim();
    if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 1) {
            return Math.floor(n);
        }
    }
    return process.env.NODE_ENV === 'production' ? 1 : 2;
}

export const mediaConfig = {
    /** Max multipart audio size for sermon upload (bytes). Default 512 MiB (2 hr MP3). */
    sermonAudioMaxBytes:
        Number(process.env.SERMON_AUDIO_MAX_BYTES) || mb(512),

    /** Allowed MIME types for sermon audio upload (strict allowlist). */
    sermonAudioMimeAllowlist: new Set(
        (process.env.SERMON_AUDIO_MIME_ALLOWLIST?.split(',') ?? [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/aac',
            'audio/x-m4a',
            'audio/mp4',
            'audio/x-caf',
        ])
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean),
    ),

    /**
     * Public CDN origin for HLS objects (no trailing slash).
     * Example: https://d111111abcdef8.cloudfront.net
     */
    mediaCdnBaseUrl: (process.env.MEDIA_CDN_BASE_URL || '').replace(
        /\/$/,
        '',
    ),

    /** When true, run single-pass loudnorm to WAV before HLS packaging (extra CPU). */
    audioLoudnormBeforeHls: process.env.AUDIO_LOUDNORM_BEFORE_HLS === 'true',

    /** Parallel HLS packaging jobs per API process (keep low on 4–8 vCPU for 1–2 hr sermons). */
    hlsWorkerConcurrency: defaultHlsWorkerConcurrency(),

    /** Temp directory root for ffmpeg HLS scratch (set to large gp3 mount in prod). */
    hlsWorkDir: (process.env.HLS_WORK_DIR || '').trim() || undefined,

    /** HTTP server close timeout on SIGTERM before force exit (ms). */
    gracefulShutdownMs: Number(process.env.GRACEFUL_SHUTDOWN_MS) || 120_000,
} as const;
