export interface RecommendationsState {
    homeMixes: unknown[];
    recentlyConsumedGenres: string[];
    moodProfile: unknown;
    listeningHabits: unknown;
    contextSignals: Record<string, unknown>;
    generatedPlaylistIds: string[];
    aiDj: { sessionId: string | null; isActive: boolean };
    isLoading: boolean;
    error: string | null;
}

export type RecommendationsAction = { type: string; payload?: unknown };
