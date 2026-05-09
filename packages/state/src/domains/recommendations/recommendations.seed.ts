import type { RecommendationsState } from './recommendations.types';

export const recommendationsInitial: RecommendationsState = {
    homeMixes: [],
    recentlyConsumedGenres: [],
    moodProfile: null,
    listeningHabits: null,
    contextSignals: {},
    generatedPlaylistIds: [],
    aiDj: { sessionId: null, isActive: false },
    isLoading: false,
    error: null,
};
