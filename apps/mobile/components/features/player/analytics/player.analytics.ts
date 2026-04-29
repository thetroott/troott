type PlayerEventName =
    | 'player_play_clicked'
    | 'player_pause_clicked'
    | 'player_next'
    | 'player_previous'
    | 'player_seek'
    | 'player_shuffle_toggled'
    | 'player_repeat_toggled';

export type PlayerAnalyticsContext = {
    track_id?: string | null;
    artist_id?: string | null;
    source?: string;
    position?: number;
    enabled?: boolean;
};

type PosthogLike = {
    capture: (event: string, properties?: Record<string, unknown>) => void;
};

function resolvePosthogClient(): PosthogLike | null {
    const candidate = (globalThis as { posthog?: PosthogLike }).posthog;
    if (candidate && typeof candidate.capture === 'function') return candidate;
    return null;
}

export function capturePlayerEvent(
    event: PlayerEventName,
    context: PlayerAnalyticsContext = {},
) {
    if (context.enabled === false) return;
    const posthog = resolvePosthogClient();
    if (!posthog) return;

    posthog.capture(event, {
        track_id: context.track_id ?? null,
        artist_id: context.artist_id ?? null,
        source: context.source ?? 'full_player',
        position: context.position,
    });
}
