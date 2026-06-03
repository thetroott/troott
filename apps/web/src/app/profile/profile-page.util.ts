import {
    formatInsightMetric,
    formatProfileAudienceLine,
} from '@/app/profile/profile-format.util';
import {
    isMinisterProfile,
    type Asset,
    type ProfileDTO,
} from '@/app/profile/profile.types';

export { formatInsightMetric, formatProfileAudienceLine };

export function profileImageSrc(
    asset: Asset | null | undefined,
    opts?: { v?: string | number },
): string | undefined {
    if (!asset?.url) {
        return undefined;
    }
    const raw = asset.url;
    if (opts?.v != null) {
        const sep = raw.includes('?') ? '&' : '?';
        return `${raw}${sep}v=${encodeURIComponent(String(opts.v))}`;
    }
    return raw;
}

export function getInitials(profile: ProfileDTO): string {
    const a = profile.firstName?.[0] ?? '';
    const b = profile.lastName?.[0] ?? '';
    return (a + b).toUpperCase() || '?';
}

export function getDisplayName(profile: ProfileDTO): string {
    if (isMinisterProfile(profile) && profile.ministerialName) {
        return profile.ministerialName;
    }
    const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    return full || profile.email || 'Your name';
}

export function formatMemberSince(iso: string): string {
    if (!iso) return '\u2014';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '\u2014';
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}
