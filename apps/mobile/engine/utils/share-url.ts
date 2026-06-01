import api from '@/api/api';

const WEB_BASE =
    process.env.EXPO_PUBLIC_APP_WEB_BASE?.replace(/\/$/, '') ??
    'https://app.troott.com';

export type ResolveShareUrlInput = {
    sermonId?: string | null;
    shareableUrl?: string | null;
    title?: string | null;
};

/**
 * Resolves the URL to copy/share: DTO field → GET sermon → env fallback.
 */
export async function resolveShareUrl(
    input: ResolveShareUrlInput,
): Promise<string> {
    const preset = input.shareableUrl?.trim();
    if (preset) {
        return preset;
    }

    const id =
        input.sermonId != null && String(input.sermonId).length > 0
            ? String(input.sermonId)
            : '';

    if (id.length > 0) {
        try {
            const res = await api.sermon.getSermonById(id);
            if (!res.error && res.data != null && typeof res.data === 'object') {
                const fromApi = (res.data as Record<string, unknown>)
                    .shareableUrl;
                if (typeof fromApi === 'string' && fromApi.trim()) {
                    return fromApi.trim();
                }
            }
        } catch {
            /* use fallback below */
        }
        return `${WEB_BASE}/track/${encodeURIComponent(id)}`;
    }

    const slug = (input.title ?? 'sermon')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');
    return `${WEB_BASE}/track/${encodeURIComponent(slug)}`;
}

export { WEB_BASE as shareWebBaseUrl };
