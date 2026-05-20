import {
    DeviceType,
    MediaSourceType,
    PlatformType,
    RepeatMode,
} from '@/dtos/playback.dto';
import {
    StreamingProtocol,
    StreamingQuality,
} from '@/dtos/sermon-media.types';

export interface PlaybackSessionMediaMinister {
    id: string;
    name: string;
    avatar?: string;
}

export interface PlaybackSessionMediaSeries {
    id: string;
    title: string;
}

export interface PlaybackSessionMediaItem {
    id: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    imageUrl: string;
    playbackUrl: string;
    manifestUrl: string;
    protocol: StreamingProtocol;
    quality: StreamingQuality;
    mimeType: string;
    duration: number;
    minister: PlaybackSessionMediaMinister;
    series: PlaybackSessionMediaSeries | null;
    allowDownload: boolean;
    allowComment: boolean;
}

export interface PlaybackSession {
    id: string;
    code: string;
    currentMediaItem: PlaybackSessionMediaItem;
    listener: string;
    sourceType: MediaSourceType;
    sourceId: string;
    queueRef: string;
    queueShuffled: boolean;
    queueIndex: number;
    isPlaying: boolean;
    isPaused: boolean;
    isBuffering: boolean;
    volume: number;
    muted: boolean;
    shuffle: boolean;
    playbackRate: number;
    repeatMode: RepeatMode;
    deviceType: DeviceType;
    platform: PlatformType;
    isActive: boolean;
    startedAt: string;
    lastHeartbeatAt: string;
    syncVersion: number;
    _version?: number;
    _id?: string;
}

export enum MediaQuality {
    LOW = 'low',
    HIGH = 'high',
    LOSSLESS = 'lossless',
}

export default PlaybackSession;
