import type {
    SermonDownload,
    SermonDownloadProgress,
    SermonDownloadProgressState,
    SermonTrackDTO,
} from '@/types/sermon';
import axios from 'axios';
import { MMKV } from 'react-native-mmkv';
import RNFS from 'react-native-fs';
import { queryClient } from '@/services/query-client';
import { DownloadQueryKeys } from '@/engine/types/queries-type';
// import SermonTrack from '../../../types/SermonTrack'
// import axios from 'axios'
// import {
// 	SermonDownload,
// 	SermonDownloadProgress,
// 	SermonDownloadProgressState,
// } from '../../../types/SermonDownload'
// import { queryClient } from '../../../constants/query-client'
// import { AUDIO_CACHE_QUERY } from '../../queries/download/constants'

type DownloadedFileInfo = {
    uri: string;
    path: string;
    fileName: string;
    size: number;
};

export type DeleteDownloadsResult = {
    deletedCount: number;
    freedBytes: number;
    failedCount: number;
};

export async function downloadSermonfinFile(
    url: string,
    name: string,
    sermonName: string,
    setDownloadProgress: SermonDownloadProgressState,
): Promise<DownloadedFileInfo> {
    try {
        // Fetch the file
        const headRes = await axios.head(url);
        const contentType = headRes.headers['content-type'];

        // Step 2: Get extension from content-type
        let extension = 'mp3'; // default extension
        if (contentType && contentType.includes('/')) {
            const parts = contentType.split('/');
            const container = parts[1].split(';')[0]; // handles "audio/m4a; charset=utf-8"
            if (container !== 'mpeg') {
                extension = container; // don't use mpeg as an extension, use the default extension
            }
        }

        // Step 3: Build path
        const fileName = `${name}.${extension}`;
        const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        setDownloadProgress((prev: SermonDownloadProgress) => ({
            ...prev,
            [url]: { progress: 0, name: fileName, sermonName: sermonName },
        }));

        // Step 4: Start download with progress
        const options = {
            fromUrl: url,
            toFile: downloadDest,

            /* eslint-disable @typescript-eslint/no-explicit-any */
            begin: (res: any) => {
                console.log('Download started');
            },
            progress: (data: any) => {
                const percent = +(
                    data.bytesWritten / data.contentLength
                ).toFixed(2);

                setDownloadProgress((prev: SermonDownloadProgress) => ({
                    ...prev,
                    [url]: {
                        progress: percent,
                        name: fileName,
                        sermonName: sermonName,
                    },
                }));
            },
            background: true,
            progressDivider: 1,
        };

        const result = await RNFS.downloadFile(options).promise;
        console.log('Download complete:', result);

        const metadata = await RNFS.stat(downloadDest);

        return {
            uri: `file://${downloadDest}`,
            path: downloadDest,
            fileName,
            size: Number(metadata.size),
        };
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
}

const MMKV_OFFLINE_MODE_KEYS = {
    AUDIO_CACHE: 'audioCache',
    AUDIO_CACHE_LIMIT: 'audioCacheLimit',
};

type OfflineKV = Pick<
    MMKV,
    'contains' | 'set' | 'getString' | 'getNumber' | 'delete'
>;

function mediaUrlToDownloadString(url: SermonTrackDTO['url']): string {
    if (url == null) return '';
    if (typeof url === 'string') return url;
    if (typeof url === 'number') return '';
    if (typeof url === 'object' && 'uri' in url) {
        const u = (url as { uri: unknown }).uri;
        return typeof u === 'string' ? u : '';
    }
    return '';
}

function createMemoryOfflineKV(): OfflineKV {
    const data = new Map<string, string | number | boolean>();
    return {
        contains: (key) => data.has(key),
        set: (key, value) => {
            if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean'
            ) {
                data.set(key, value);
            }
        },
        getString: (key) => {
            const v = data.get(key);
            return typeof v === 'string' ? v : undefined;
        },
        getNumber: (key) => {
            const v = data.get(key);
            return typeof v === 'number' ? v : undefined;
        },
        delete: (key) => {
            data.delete(key);
        },
    };
}

let _offlineKv: MMKV | OfflineKV | null = null;

function getOfflineKV(): MMKV | OfflineKV {
    if (_offlineKv) return _offlineKv;
    try {
        _offlineKv = new MMKV({
            id: 'offlineMode',
            encryptionKey: 'offlineMode',
        });
        return _offlineKv;
    } catch {
        console.warn(
            '[offline] MMKV unavailable (JSI / debugger); using in-memory offline cache for this session.',
        );
        _offlineKv = createMemoryOfflineKV();
        return _offlineKv;
    }
}

function ensureDefaultAudioCacheLimit(kv: MMKV | OfflineKV) {
    if (!kv.contains(MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE_LIMIT)) {
        kv.set(MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE_LIMIT, 20);
    }
}

function getAudioCacheLimitValue(): number {
    const kv = getOfflineKV();
    ensureDefaultAudioCacheLimit(kv);
    return kv.getNumber(MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE_LIMIT) ?? 20;
}

/** @deprecated use getAudioCacheLimitValue / engine helpers */
export const getDefaultAudioCacheLimit = () => {
    ensureDefaultAudioCacheLimit(getOfflineKV());
};

export const saveAudio = async (
    track: SermonTrackDTO,
    setDownloadProgress: SermonDownloadProgressState,
    isAutoDownloaded: boolean = true,
): Promise<boolean> => {
    const AUDIO_CACHE_LIMIT = getAudioCacheLimitValue();
    if (
        isAutoDownloaded &&
        AUDIO_CACHE_LIMIT &&
        (!Number.isFinite(AUDIO_CACHE_LIMIT) || AUDIO_CACHE_LIMIT <= 0)
    ) {
        // If the cache limit is not set or is not a number, or is less than 0, Dont Auto Download
        return false;
    }

    const existingRaw = getOfflineKV().getString(
        MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE,
    );
    let existingArray: SermonDownload[] = [];
    try {
        if (existingRaw) {
            existingArray = JSON.parse(existingRaw);
        }
    } catch (error) {
        //Ignore
    }

    try {
        console.debug('Downloading audio');

        const downloadedTrackFile = await downloadSermonfinFile(
            mediaUrlToDownloadString(track.url),
            track.item.id as string,
            track.title as string,
            setDownloadProgress,
        );
        let downloadedArtworkFile: DownloadedFileInfo | undefined;
        const artworkSource =
            typeof track.artwork === 'string'
                ? track.artwork
                : typeof track.artworkUrl === 'string'
                ? track.artworkUrl
                : undefined;
        if (artworkSource) {
            downloadedArtworkFile = await downloadSermonfinFile(
                artworkSource,
                track.item.id as string,
                track.title as string,
                setDownloadProgress,
            );
        }
        console.log('downloadtrack', downloadedTrackFile);
        track.url = downloadedTrackFile.uri;
        if (downloadedArtworkFile) track.artwork = downloadedArtworkFile.uri;

        const index = existingArray.findIndex(
            (t) => t.item.id === track.item.id,
        );

        const downloadEntry: SermonDownload = {
            ...track,
            savedAt: new Date().toISOString(),
            isAutoDownloaded,
            path: downloadedTrackFile.uri,
            fileSizeBytes: downloadedTrackFile.size,
            artworkSizeBytes: downloadedArtworkFile?.size,
        };

        if (index >= 0) {
            // Replace existing
            existingArray[index] = downloadEntry;
        } else {
            // Add new
            existingArray.push(downloadEntry);
        }
    } catch (error) {
        return false;
    }
    getOfflineKV().set(
        MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE,
        JSON.stringify(existingArray),
    );
    queryClient.invalidateQueries({
        queryKey: [DownloadQueryKeys.DownloadedTracks],
    });
    return true;
};

export const deleteAudio = async (itemId: string | undefined | null) => {
    if (!itemId) return;
    await deleteDownloadsByIds([itemId]);
};

const setAudioCache = (downloads: SermonDownload[]) => {
    getOfflineKV().set(
        MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE,
        JSON.stringify(downloads),
    );
};

export const getAudioCache = (): SermonDownload[] => {
    const existingRaw = getOfflineKV().getString(
        MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE,
    );
    let existingArray: SermonDownload[] = [];
    try {
        if (existingRaw) {
            existingArray = JSON.parse(existingRaw);
        }
    } catch (error) {
        //Ignore
    }
    return existingArray;
};

const stripFileScheme = (path: string) => path.replace('file://', '');

const isLocalFile = (path: string) =>
    path.startsWith('file://') || path.startsWith(RNFS.DocumentDirectoryPath);

const deleteLocalFileIfExists = async (
    path: string | undefined,
    fallbackSize?: number,
): Promise<number> => {
    if (!path || !isLocalFile(path)) return 0;

    const normalizedPath = stripFileScheme(path);
    try {
        const exists = await RNFS.exists(normalizedPath);
        let size = fallbackSize ?? 0;
        if (exists && !fallbackSize) {
            const stat = await RNFS.stat(normalizedPath);
            size = Number(stat.size);
        }
        if (exists) await RNFS.unlink(normalizedPath);
        return size;
    } catch (error) {
        console.warn('Failed to delete file', normalizedPath, error);
        return 0;
    }
};

const deleteDownloadAssets = async (
    download: SermonDownload,
): Promise<number> => {
    let freedBytes = 0;
    freedBytes += await deleteLocalFileIfExists(
        download.path,
        download.fileSizeBytes,
    );
    freedBytes += await deleteLocalFileIfExists(
        typeof download.artwork === 'string' ? download.artwork : undefined,
        download.artworkSizeBytes,
    );
    return freedBytes;
};

export const deleteDownloadsByIds = async (
    itemIds: (string | null | undefined)[],
): Promise<DeleteDownloadsResult> => {
    const targets = new Set(itemIds.filter(Boolean) as string[]);
    if (targets.size === 0)
        return {
            deletedCount: 0,
            failedCount: 0,
            freedBytes: 0,
        };

    const downloads = getAudioCache();
    const remaining: SermonDownload[] = [];
    let freedBytes = 0;
    let deletedCount = 0;
    let failedCount = 0;

    for (const download of downloads) {
        if (!targets.has(download.item.id as string)) {
            remaining.push(download);
            continue;
        }

        try {
            freedBytes += await deleteDownloadAssets(download);
            deletedCount += 1;
        } catch (error) {
            failedCount += 1;
            remaining.push(download);
            console.error('Failed to delete download', download.item.id, error);
        }
    }

    setAudioCache(remaining);
    queryClient.invalidateQueries({
        queryKey: [DownloadQueryKeys.DownloadedTracks],
    });

    return {
        deletedCount,
        failedCount,
        freedBytes,
    };
};

export const deleteAudioCache = async (): Promise<DeleteDownloadsResult> => {
    const downloads = getAudioCache();
    const result = await deleteDownloadsByIds(
        downloads.map((download) => download.item.id),
    );
    getOfflineKV().delete(MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE);
    return result;
};

export const purneAudioCache = async () => {
    const existingRaw = getOfflineKV().getString(
        MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE,
    );
    if (!existingRaw) return;

    let existingArray: SermonDownload[] = [];

    try {
        existingArray = JSON.parse(existingRaw);
    } catch (e) {
        return;
    }

    const autoDownloads = existingArray
        .filter((item) => item.isAutoDownloaded)
        .sort(
            (a, b) =>
                new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
        ); // oldest first

    const excess = autoDownloads.length - getAudioCacheLimitValue();
    if (excess <= 0) return;

    // Remove the oldest `excess` files
    const itemsToDelete = autoDownloads.slice(0, excess);
    for (const item of itemsToDelete) {
        await deleteDownloadAssets(item);
        existingArray = existingArray.filter((i) => i.item.id !== item.item.id);
    }

    getOfflineKV().set(
        MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE,
        JSON.stringify(existingArray),
    );
};

export const setAudioCacheLimit = (limit: number) => {
    getOfflineKV().set(MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE_LIMIT, limit);
};

export const getAudioCacheLimit = () => {
    return getOfflineKV().getNumber(MMKV_OFFLINE_MODE_KEYS.AUDIO_CACHE_LIMIT);
};
