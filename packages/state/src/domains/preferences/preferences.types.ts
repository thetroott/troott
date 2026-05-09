export interface PreferencesState {
    theme: string | null;
    language: string | null;
    audioQuality: string | null;
    dataSaver: boolean;
    autoplay: boolean;
    crossfadeMs: number;
    explicitContentFilter: boolean;
    offlineMode: boolean;
    reducedMotion: boolean;
    reducedHaptics: boolean;
    analyticsOptIn: boolean;
    runTimesVisible: boolean;
    swipeActions: { left: string[]; right: string[] };
    privacy: {
        listeningActivityVisible: boolean;
        allowFollow: boolean;
        allowSharedHistory: boolean;
    };
}

export type PreferencesAction = { type: string; payload?: unknown };
