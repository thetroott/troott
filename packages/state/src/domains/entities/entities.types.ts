/** Normalized entity maps (sermons as tracks, series, ministers, etc.). */
export interface EntitiesState {
    tracks: Record<string, unknown>;
    series: Record<string, unknown>;
    artists: Record<string, unknown>;
    ministers: Record<string, unknown>;
    creators: Record<string, unknown>;
    playlists: Record<string, unknown>;
    bites: Record<string, unknown>;
}

export type EntitiesAction = { type: string; payload?: unknown };
