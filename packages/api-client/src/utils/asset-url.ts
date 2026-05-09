export type AssetResizeOptions = {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
};

/**
 * Builds an absolute URL for CDN/storage paths. Pass resize hints when your edge supports them.
 */
export function resolveAssetUrl(
    baseOrPath: string,
    opts?: AssetResizeOptions,
): string {
    if (!baseOrPath) return '';
    if (/^https?:\/\//i.test(baseOrPath)) {
        return appendResizeParams(baseOrPath, opts);
    }
    const origin =
        typeof window !== 'undefined' && window.location?.origin
            ? window.location.origin
            : '';
    const path = baseOrPath.startsWith('/') ? baseOrPath : `/${baseOrPath}`;
    return appendResizeParams(`${origin}${path}`, opts);
}

function appendResizeParams(url: string, opts?: AssetResizeOptions): string {
    if (!opts?.width && !opts?.height && !opts?.quality && !opts?.format) {
        return url;
    }
    try {
        const u = new URL(url);
        if (opts.width) u.searchParams.set('w', String(opts.width));
        if (opts.height) u.searchParams.set('h', String(opts.height));
        if (opts.quality) u.searchParams.set('q', String(opts.quality));
        if (opts.format) u.searchParams.set('fm', opts.format);
        return u.toString();
    } catch {
        return url;
    }
}
