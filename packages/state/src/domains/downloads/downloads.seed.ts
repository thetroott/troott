import type { DownloadsState } from './downloads.types';

export const downloadsInitial: DownloadsState = {
    trackIds: [],
    seriesIds: [],
    playlistIds: [],
    biteIds: [],
    progress: {},
    syncStatus: null,
    cacheBytes: 0,
    cacheLimitBytes: 0,
    quality: 'standard',
    autoDownloadEnabled: false,
};
