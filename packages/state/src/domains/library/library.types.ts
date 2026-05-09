export interface LibraryState {
    likedTrackIds: string[];
    likedSeriesIds: string[];
    likedArtistIds: string[];
    likedMinisterIds: string[];
    savedPlaylistIds: string[];
    savedBiteIds: string[];
    likedBiteIds: string[];
    hiddenTrackIds: string[];
    blockedArtistIds: string[];
    mostPlayedTrackIds: string[];
    recentlyAddedAt: Record<string, string>;
    isLoading: boolean;
    error: string | null;
}

export type LibraryAction = { type: string; payload?: unknown };
