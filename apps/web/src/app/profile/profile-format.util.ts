/** Display formatting for `/profile` metrics and contact lines (feat-0024). */

export function formatInsightMetric(value: number | undefined | null): string {
    if (value == null || !Number.isFinite(value)) {
        return '\u2014';
    }
    return Math.round(value).toLocaleString('en-US');
}

/** Compact count for hero audience line (e.g. 600000 → 600K). */
export function formatCompactCount(value: number | undefined | null): string | null {
    if (value == null || !Number.isFinite(value) || value < 0) {
        return null;
    }
    const n = Math.round(value);
    if (n >= 1_000_000) {
        const m = n / 1_000_000;
        const rounded = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10;
        return `${rounded}M`;
    }
    if (n >= 1_000) {
        const k = n / 1_000;
        const rounded = k >= 10 ? Math.round(k) : Math.round(k * 10) / 10;
        return `${rounded}K`;
    }
    return n.toLocaleString('en-US');
}

export function formatProfileAudienceLine(
    monthlyListeners: number | undefined,
    followers: number | undefined,
): string | null {
    const parts: string[] = [];
    const monthly = formatCompactCount(monthlyListeners);
    if (monthly != null) {
        parts.push(`${monthly} monthly audience`);
    }
    const fol = formatCompactCount(followers);
    if (fol != null) {
        parts.push(`${fol} Followers`);
    }
    if (parts.length === 0) {
        return null;
    }
    return parts.join(' \u2022 ');
}

export function formatProfilePhone(
    phoneNumber?: string,
    phoneCode?: string,
    countryPhone?: string,
): string | null {
    const num = phoneNumber?.trim();
    if (!num) {
        return null;
    }
    const code = phoneCode?.trim() || countryPhone?.trim();
    if (code && !num.startsWith('+') && !num.startsWith(code)) {
        return `${code} ${num}`.trim();
    }
    return num;
}

export function formatSermonPlaysLabel(plays: number): string {
    const n = Number.isFinite(plays) ? Math.max(0, Math.round(plays)) : 0;
    return `${n.toLocaleString('en-US')} plays`;
}

export function formatSermonRecentDate(ms: number | undefined): string {
    if (ms == null || !Number.isFinite(ms)) {
        return '\u2014';
    }
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
        return '\u2014';
    }
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
