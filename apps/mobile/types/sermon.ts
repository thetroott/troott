import type { Dispatch, SetStateAction } from 'react';
import type { MediaItem } from '@rntp/player';

import type { QueuingType } from '@/utils/enums.util';
import type { MediaSourceInfo } from '@/utils/interface.utl';

export type SourceType = 'stream' | 'download';

export interface SermonItemDTO {
    id: string | null;
    sermon?: SermonItemDTO;
    title?: string | null;
    originalTitle?: string | null;
    minister?: string | null;
    duration?: number | null;
    /** String URI or local asset module id from `require()` */
    image?: string | number | null;
    description?: string | null;
    topic?: string | null;
    releaseDate?: string | null;
    size?: number;
    tags?: Array<string> | null;
    isPublic?: boolean;
    releaseYear?: number;
    shareableUrl?: string | null;
    isSeries?: boolean;
    seriesTitle?: string | null;
    series?: Array<string>;
    seriesId?: string | null;

    totalPlays?: number;

    sourceType: string | null;

    /** Local asset id or remote URL for playback */
    url?: string | number | null;

    /** Cover art URI string or local asset module (require) */
    artwork?: string | number | null;
}

export type BaseSermonDtoSlimified = Pick<
    SermonItemDTO,
    'id' | 'title' | 'image' | 'seriesId' | 'sourceType'
>;

/**
 * Queue row: native {@link MediaItem} plus Troott metadata.
 * Use `mediaId` / `url` for the player; `item` links back to catalog rows.
 */
export type SermonTrackDTO = MediaItem & {
    item: BaseSermonDtoSlimified;
    sourceType: SourceType;
    mediaSourceInfo?: MediaSourceInfo;
    sessionId: string | null | undefined;
    duration: number;
    /** Legacy alias for `mediaId` (some call sites use `track.id`). */
    id?: string;
    album?: string;
    artwork?: string | number;
    description?: string | undefined;
    isLiveStream?: boolean;
    QueuingType?: QueuingType | undefined;
};

/**
 * Catalog / loader row shape (artist, url, sermon asset, etc.) used before mapping to {@link SermonItemDTO}.
 */
export type ISermonTrack = SermonItemDTO & {
    artist?: string | null;
    sermon?: string | number | null;
};

export enum SermonStreamType {
    Default = 'default',
    Dash = 'dash',
    HLS = 'hls',
    SmoothStreaming = 'smoothstreaming',
}

export type SermonDownload = SermonTrackDTO & {
    savedAt: string;
    isAutoDownloaded: boolean;
    fileSizeBytes?: number;
    artworkSizeBytes?: number;
    playCount?: number;
    lastPlayedAt?: string;
    /** Path to the downloaded file (may be undefined for legacy rows). */
    path: string | undefined;
};

export type SermonDownloadProgress = {
    [url: string]: {
        progress: number;
        name: string;
        sermonName: string;
    };
};

export type SermonDownloadProgressState = Dispatch<
    SetStateAction<SermonDownloadProgress>
>;
