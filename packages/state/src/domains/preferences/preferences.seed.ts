import type { PreferencesState } from './preferences.types';

export const preferencesInitial: PreferencesState = {
    theme: null,
    language: null,
    audioQuality: null,
    dataSaver: false,
    autoplay: true,
    crossfadeMs: 0,
    explicitContentFilter: false,
    offlineMode: false,
    reducedMotion: false,
    reducedHaptics: false,
    analyticsOptIn: false,
    runTimesVisible: true,
    swipeActions: { left: [], right: [] },
    privacy: {
        listeningActivityVisible: true,
        allowFollow: true,
        allowSharedHistory: false,
    },
};
