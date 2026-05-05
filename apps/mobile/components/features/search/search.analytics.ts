export type SearchAnalyticsEvent =
    | 'search_committed'
    | 'search_history_cleared'
    | 'search_retry_tapped';

type PosthogLike = {
    capture: (event: string, properties?: Record<string, unknown>) => void;
};

function resolvePosthogClient(): PosthogLike | null {
    const candidate = (globalThis as { posthog?: PosthogLike }).posthog;
    if (candidate && typeof candidate.capture === 'function') return candidate;
    return null;
}

/** Best-effort PostHog capture when available (same pattern as player analytics). */
export function captureSearchEvent(
    event: SearchAnalyticsEvent,
    properties?: Record<string, unknown>,
): void {
    const posthog = resolvePosthogClient();
    if (!posthog) return;
    posthog.capture(event, properties ?? {});
}
