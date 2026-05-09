export interface DownloadsState {
    trackIds: string[];
    seriesIds: string[];
    playlistIds: string[];
    biteIds: string[];
    progress: Record<string, number>;
    syncStatus: string | null;
    cacheBytes: number;
    cacheLimitBytes: number;
    quality: 'low' | 'standard' | 'high' | 'lossless';
    autoDownloadEnabled: boolean;
}

export type DownloadsAction = { type: string; payload?: unknown };
