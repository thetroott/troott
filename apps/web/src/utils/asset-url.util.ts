import type { Asset } from '@/app/profile/profile.types';

/**
 * Resolves a stored S3 key into a displayable URL.
 *
 * Strategy: if `VITE_ASSET_BASE_URL` is set we treat the bucket as public via
 * a CDN/origin and append the `s3Key`. Otherwise we fall back to the AWS
 * default S3 origin pattern using the bucket from `VITE_S3_BUCKET` if set.
 *
 * `opts.v` is appended as a cache-busting query param; pass `profile.updatedAt`
 * so a new upload invalidates browser/CDN caches without a hard reload.
 */
export function resolveAssetUrl(
    asset: Asset | { fileName?: string; s3Key?: string } | null | undefined,
    opts?: { v?: string | number },
): string | undefined {
    if (!asset || !asset.s3Key) return undefined;

    const meta = (import.meta as { env?: Record<string, string | undefined> })
        .env;
    const cdn = meta?.VITE_ASSET_BASE_URL?.replace(/\/+$/, '');
    const bucket = meta?.VITE_S3_BUCKET;
    const region = meta?.VITE_S3_REGION ?? 'us-east-1';

    let base: string | undefined;
    if (cdn) {
        base = cdn;
    } else if (bucket) {
        base = `https://${bucket}.s3.${region}.amazonaws.com`;
    }
    if (!base) return undefined;

    const key = asset.s3Key.replace(/^\/+/, '');
    const url = `${base}/${key}`;
    if (opts?.v != null) {
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}v=${encodeURIComponent(String(opts.v))}`;
    }
    return url;
}
