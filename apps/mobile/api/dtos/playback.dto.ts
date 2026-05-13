/**
 * Playback / streaming DTOs aligned with `apps/api/src/dtos/core/playback.dto.ts`.
 * Uses `@/models` for documents and playback enums.
 */
import type Listener from '@/models/Listener.model';
import type PlaybackSession from '@/models/PlaybackSession.model';
import type Sermon from '@/models/Sermon.model';
import {
    ConnectionType,
    DeviceInfo,
    DeviceType,
    MediaSourceType,
    NetworkType,
    PlatformType,
    RepeatMode,
    SkipReason,
} from '@/models/Playback.model';
import {
    SermonStreamingProtocol,
    SermonStreamingQuality,
    SermonTokenType,
} from '@/models/Sermon.model';

export interface StreamingDTO {
    code: string;

    listener: Listener;
    mediaItem: Sermon;

    playbackUrl: string;
    manifestUrl: string;

    session: PlaybackSession;

    protocol: SermonStreamingProtocol;
    mimeType: string;

    bitrate: number;
    quality: SermonStreamingQuality;

    token: string;
    tokenType: SermonTokenType;

    expiresAt: string;
    issuedAt: string;

    isRevoked: boolean;
    revokedAt?: string;

    allowDownload: boolean;
    requiresAuth: boolean;
    requiresSubscription: boolean;

    deviceId: string;
    ipAddress: string;
}

export interface StartSessionDTO {
    mediaItemId: string;
    sourceType: MediaSourceType;
    sourceId: string;

    queueRef?: string;
    queueIndex?: number;

    deviceType: DeviceType;
    platform: PlatformType;
    deviceInfo: DeviceInfo;

    networkType: NetworkType;
    connectionType?: ConnectionType;

    offlineMode: boolean;
}

export interface UpdateSessionDTO {
    isPlaying?: boolean;
    isPaused?: boolean;
    isBuffering?: boolean;

    volume?: number;
    muted?: boolean;
    shuffle?: boolean;
    playbackRate?: number;
    repeatMode?: RepeatMode;

    queueIndex?: number;
    queueShuffled?: boolean;

    currentMediaItemId?: string;

    networkType?: NetworkType;
    connectionType?: ConnectionType;
}

export interface TransferSessionDTO {
    fromSessionId: string;

    deviceType: DeviceType;
    platform: PlatformType;
    deviceInfo: DeviceInfo;
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

    protocol: SermonStreamingProtocol;
    quality: SermonStreamingQuality;
    mimeType: string;

    duration: number;

    minister: PlaybackMediaItemMinisterDTO;
    series: PlaybackMediaItemSeriesDTO | null;

    allowDownload: boolean;
    allowComment: boolean;
}

export interface PlaybackHistoryItemDTO {
    id: string;
    mediaItem: PlaybackMediaItemDTO;
    listenedAt: string;
    completionRate: number;
    currentPositionMs: number;
    completed: boolean;
}

export interface PlaybackHistoryResponseDTO {
    items: PlaybackHistoryItemDTO[];
    total: number;
    hasMore: boolean;
    cursor?: string;
}
