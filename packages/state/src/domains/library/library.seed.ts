import type { LibraryState } from './library.types';

export const libraryInitial: LibraryState = {
    likedTrackIds: [],
    likedSeriesIds: [],
    likedArtistIds: [],
    likedMinisterIds: [],
    savedPlaylistIds: [],
    savedBiteIds: [],
    likedBiteIds: [],
    hiddenTrackIds: [],
    blockedArtistIds: [],
    mostPlayedTrackIds: [],
    recentlyAddedAt: {},
    isLoading: false,
    error: null,
};
