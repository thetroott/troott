/** Figma Search idle when user already has recent searches (5176:22322, 5176:22410, 5176:22776). */
export const SEARCH_QUERY_PLACEHOLDER =
    'What would you like to listen to?';

/**
 * Figma Clear-recents / empty-history query field (5189:25547).
 * Use when there is no local search history so copy matches the “fresh start” screen.
 */
export const SEARCH_QUERY_PLACEHOLDER_EMPTY_HISTORY =
    'Search sermons, pastors, topics…';

/** Curated chips for empty-history discovery (plan Phase 4); replace with API when available. */
export const TRENDING_SEARCH_QUERIES = [
    'Faith',
    'Grace',
    'Healing',
    'Prayer',
    'Hope',
    'Forgiveness',
] as const;

/** Figma search field fill (5176:22322). */
export const SEARCH_FIELD_FILL = '#262626';

/** Legacy alias — some call sites used `PLACEHOLDER`; prefer `SEARCH_QUERY_PLACEHOLDER`. */
export const PLACEHOLDER = SEARCH_QUERY_PLACEHOLDER;

/** Pause before running catalogue search (Spotify-like intent detection). */
export const SEARCH_DEBOUNCE_MS = 600;

/** Avoid noisy / overly broad API calls for single-character input. */
export const SEARCH_MIN_QUERY_LENGTH = 2;

/**
 * Canonical form for React Query keys, API `q`, history dedup, and analytics payloads.
 * Does not mutate user-visible input — derive from the raw field string when needed.
 *
 * Steps: trim, collapse whitespace, lowercase, fold diacritics (NFD), strip leading/trailing
 * non-letter/non-number characters (Unicode-aware where supported).
 */
export function canonicalSearchQuery(raw: string): string {
    let s = raw.trim().replace(/\s+/g, ' ').toLowerCase();
    try {
        s = s.normalize('NFD').replace(/\p{M}/gu, '');
    } catch {
        /* ignore if runtime lacks Unicode property escapes */
    }
    try {
        s = s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    } catch {
        s = s.replace(/^[^a-z0-9\s]+|[^a-z0-9\s]+$/gi, '');
    }
    return s.replace(/\s+/g, ' ').trim();
}

/**
 * @alias canonicalSearchQuery — kept for existing imports (history, committed term).
 */
export function normalizeSearchQuery(raw: string): string {
    return canonicalSearchQuery(raw);
}
