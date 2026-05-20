/**
 * Playback enums and DTOs aligned with `apps/api`:
 * - `interfaces/core/playback.interface.ts`
 * - `dtos/core/playback.dto.ts`
 */

import {
    StreamingProtocol,
    StreamingQuality,
} from './sermon-media.types';

export { StreamingProtocol, StreamingQuality };

export enum RepeatMode {
    OFF = 'off',
    ONE = 'one',
    ALL = 'all',
}

export enum NetworkType {
    WIFI = 'wifi',
    CELLULAR = 'cellular',
    ETHERNET = 'ethernet',
    OFFLINE = 'offline',
}

export enum ConnectionType {
    _2G = '2g',
    _3G = '3g',
    _4G = '4g',
    _5G = '5g',
}

export enum MediaSourceType {
    SERMON = 'sermon',
    SERIES = 'series',
    PLAYLIST = 'playlist',
    LIBRARY = 'library',
    SEARCH = 'search',
    RECOMMENDATION = 'recommendation',
    DOWNLOAD = 'download',
    SHARED_LINK = 'shared_link',
    LIKED_SERMONS = 'liked_sermons',
    LIKED_SERIES = 'liked_series',
    RECENTLY_PLAYED = 'recently_played',
}

export enum DeviceType {
    MOBILE = 'mobile',
    WEB = 'web',
    DESKTOP = 'desktop',
}

export enum PlatformType {
    IOS = 'ios',
    ANDROID = 'android',
    MACOS = 'macos',
    WINDOWS = 'windows',
    LINUX = 'linux',
    WEB = 'web',
    CARPLAY = 'carplay',
    ANDROID_AUTO = 'android_auto',
    SMART_TV = 'smart_tv',
}

export enum SkipReason {
    MANUAL = 'manual',
    NEXT = 'next',
    PREVIOUS = 'previous',
    SEEK = 'seek',
    APP_CLOSED = 'app_closed',
    NETWORK_ERROR = 'network_error',
    AUDIO_ERROR = 'audio_error',
    INTERRUPTED = 'interrupted',
    DEVICE_TRANSFER = 'device_transfer',
}

export interface DeviceInfo {
    deviceName: string;
    device: string;
    os: string;
    browser: string;
    appVersion: string;
    osVersion: string;
    browserVersion: string;
}

export interface PlaybackMediaItemMinisterDTO {
    id: string;
    name: string;
    avatar?: string;
}

export interface PlaybackMediaItemSeriesDTO {
    id: string;
    title: string;
}

export interface PlaybackMediaItemDTO {
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
    minister: PlaybackMediaItemMinisterDTO;
    series: PlaybackMediaItemSeriesDTO | null;
    allowDownload: boolean;
    allowComment: boolean;
}

export interface SessionResponseDTO {
    id: string;
    code: string;
    currentMediaItem: PlaybackMediaItemDTO;
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
}

export interface RecordPlaybackDTO {
    sessionId: string;
    mediaItemId: string;
    sourceType: MediaSourceType;
    sourceId: string;
    sourcePosition?: number;
    startPositionMs: number;
    endPositionMs: number;
    trackDurationMs: number;
    listenedDurationMs: number;
    completed?: boolean;
    skipped?: boolean;
    skipReason?: SkipReason;
    pausedCount?: number;
    seekCount?: number;
    bufferCount?: number;
    errorCount?: number;
    offlineMode: boolean;
}

export interface PlaybackEventResponseDTO {
    id: string;
    completionRate: number;
    qualifiesAsStream: boolean;
    completed: boolean;
}
