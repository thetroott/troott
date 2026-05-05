/**
 * Sermon audio ingest + streaming delivery configuration.
 * CDN base should match the hostname clients use for HLS (manifest + segments).
 */
import { AWS_BUCKET_NAME } from './aws.config';

const mb = (n: number) => n * 1024 * 1024;

/** HTTPS URL for an object when bucket allows public read OR behind CDN origin mapping to bucket. */
export function publicHttpsUrlForS3Key(key: string): string {
    const region = process.env.AWS_REGION || 'us-east-1';
    const bucket = AWS_BUCKET_NAME;
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

export const mediaConfig = {
    /** Max multipart audio size for sermon upload (bytes). Default 100 MiB. */
    sermonAudioMaxBytes: Number(process.env.SERMON_AUDIO_MAX_BYTES) || mb(100),

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
} as const;
