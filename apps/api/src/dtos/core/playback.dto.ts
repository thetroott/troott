import IListenerDoc from '@/interfaces/core/listener.interface';
import IPlaybackSessionDoc from '@/interfaces/core/playback-session.interface';
import {
    ConnectionType,
    DeviceInfo,
    DeviceType,
    MediaSourceType,
    NetworkType,
    PlatformType,
    RepeatMode,
    SkipReason,
} from '@/interfaces/core/playback.interface';
import ISermonDoc, {
    StreamingProtocol,
    StreamingQuality,
    TokenType,
} from '@/interfaces/core/sermon.interface';

/**
 * Secure, time-limited streaming delivery payload.
 *
 * Returned alongside {@link SessionResponseDTO} when playback starts.
 * Contains signed URLs, DRM tokens, and entitlement flags so the client
 * can initialise its media player without additional round-trips.
 *
 * @example POST /playback/session -> { session: SessionResponseDTO, stream: StreamingDTO }
 */
export interface StreamingDTO {
    /** Unique delivery code for this stream grant. */
    code: string;

    /** The authenticated listener receiving the stream. */
    listener: IListenerDoc;
    /** Full sermon document backing this stream. */
    mediaItem: ISermonDoc;

    /** Signed HLS/DASH playback URL. */
    playbackUrl: string;
    /** Master playlist URL (.m3u8 or .mpd). */
    manifestUrl: string;

    /** Active playback session tied to this delivery. */
    session: IPlaybackSessionDoc;

    /** Streaming protocol negotiated for this delivery. */
    protocol: StreamingProtocol;
    /** MIME type of the stream (e.g. `application/x-mpegURL`). */
    mimeType: string;

    /** Target bitrate in kbps. */
    bitrate: number;
    /** Resolved quality tier. */
    quality: StreamingQuality;

    /** Signed access token for CDN / DRM validation. */
    token: string;
    /** How the token should be interpreted by the player. */
    tokenType: TokenType;

    /** ISO-8601 timestamp when the token becomes invalid. */
    expiresAt: string;
    /** ISO-8601 timestamp when the token was minted. */
    issuedAt: string;

    /** Whether the token has been server-side revoked. */
    isRevoked: boolean;
    /** ISO-8601 timestamp of revocation, if applicable. */
    revokedAt?: string;

    /** Whether the sermon may be downloaded for offline use. */
    allowDownload: boolean;
    /** Whether authentication is required to consume this stream. */
    requiresAuth: boolean;
    /** Whether an active subscription is required. */
    requiresSubscription: boolean;

    /** Device identifier that requested the stream. */
    deviceId: string;
    /** IP address of the requesting client. */
    ipAddress: string;
}

// ---------------------------------------------------------------------------
// Session DTOs (maps to IPlaybackSessionDoc)
// ---------------------------------------------------------------------------

/**
 * Payload sent by the client to begin a new playback session.
 *
 * Creates an {@link IPlaybackSessionDoc} on the server and returns
 * a {@link SessionResponseDTO} together with a {@link StreamingDTO}.
 *
 * @example POST /playback/session
 */
export interface StartSessionDTO {
    /** The sermon (or series/playlist entry) to play. */
    mediaItemId: string;
    /** Origin surface that triggered playback (e.g. library, search, recommendation). */
    sourceType: MediaSourceType;
    /** ID of the containing resource (playlist ID, series ID, etc.). */
    sourceId: string;

    /** Reference to the active queue, if playback is queue-driven. */
    queueRef?: string;
    /** Starting position within the queue -- needed when playback starts mid-playlist. */
    queueIndex?: number;

    /** Physical device category. */
    deviceType: DeviceType;
    /** Operating system / runtime platform. */
    platform: PlatformType;
    /** Rich device metadata (name, OS version, app version, etc.). */
    deviceInfo: DeviceInfo;

    /** Network transport at session start. */
    networkType: NetworkType;
    /** Cellular generation, when applicable. */
    connectionType?: ConnectionType;

    /** Whether the listener is playing from a downloaded copy. */
    offlineMode: boolean;
}

/**
 * Partial update sent on heartbeats or playback-state changes.
 *
 * All fields are optional -- the client sends only what changed.
 * The server uses the heartbeat to refresh {@link IPlaybackSessionDoc.lastHeartbeatAt}.
 *
 * @example PUT /playback/session/:id
 */
export interface UpdateSessionDTO {
    /** Whether audio is currently playing. */
    isPlaying?: boolean;
    /** Whether playback is paused. */
    isPaused?: boolean;
    /** Whether the player is buffering. */
    isBuffering?: boolean;

    /** Current volume level (0-1). */
    volume?: number;
    /** Whether the player is muted. */
    muted?: boolean;
    /** Whether shuffle mode is enabled. */
    shuffle?: boolean;
    /** Playback speed multiplier (e.g. 1.0, 1.5, 2.0). */
    playbackRate?: number;
    /** Repeat behaviour (off, one, all). */
    repeatMode?: RepeatMode;

    /** Current position in the queue. */
    queueIndex?: number;
    /** Whether the queue order has been shuffled. */
    queueShuffled?: boolean;

    /** New media item ID when the track changes within a queue. */
    currentMediaItemId?: string;

    /** Updated network transport (may change mid-session). */
    networkType?: NetworkType;
    /** Updated cellular generation. */
    connectionType?: ConnectionType;
}

/**
 * Payload sent when the listener moves playback to a different device.
 *
 * The server ends the source session and creates a new one on the
 * target device, carrying over queue position and playback state.
 *
 * @example POST /playback/session/transfer
 */
export interface TransferSessionDTO {
    /** ID of the session being transferred away from. */
    fromSessionId: string;

    /** Device category of the new target device. */
    deviceType: DeviceType;
    /** Platform of the new target device. */
    platform: PlatformType;
    /** Rich metadata for the new target device. */
    deviceInfo: DeviceInfo;
}

/**
 * Server response representing the current state of a playback session.
 *
 * Returned on session creation, transfer, and explicit fetches.
 * {@link currentMediaItem} is a lightweight {@link PlaybackMediaItemDTO},
 * not the full {@link ISermonDoc}, to avoid over-fetching.
 *
 * @example Response body for POST /playback/session, POST /playback/session/transfer
 */
export interface SessionResponseDTO {
    /** Session document ID. */
    id: string;
    /** Human-friendly session code. */
    code: string;

    /** Lightweight sermon payload for the player UI. */
    currentMediaItem: PlaybackMediaItemDTO;
    /** Listener ID (not the full document). */
    listener: string;

    /** Origin surface that triggered playback. */
    sourceType: MediaSourceType;
    /** ID of the containing resource. */
    sourceId: string;

    /** Active queue reference. */
    queueRef: string;
    /** Whether the queue has been shuffled. */
    queueShuffled: boolean;
    /** Current index within the queue. */
    queueIndex: number;

    /** Whether audio is currently playing. */
    isPlaying: boolean;
    /** Whether playback is paused. */
    isPaused: boolean;
    /** Whether the player is buffering. */
    isBuffering: boolean;
    /** Volume level (0-1). */
    volume: number;
    /** Whether the player is muted. */
    muted: boolean;
    /** Whether shuffle mode is on. */
    shuffle: boolean;
    /** Playback speed multiplier. */
    playbackRate: number;
    /** Repeat behaviour. */
    repeatMode: RepeatMode;

    /** Device category. */
    deviceType: DeviceType;
    /** Operating system / runtime platform. */
    platform: PlatformType;

    /** Whether this session is still active. */
    isActive: boolean;
    /** ISO-8601 timestamp of session creation. */
    startedAt: string;
    /** ISO-8601 timestamp of the most recent heartbeat. */
    lastHeartbeatAt: string;

    /** Monotonically increasing version for cross-device conflict resolution. */
    syncVersion: number;
}

// ---------------------------------------------------------------------------
// Playback Event DTOs (maps to IPlaybackDoc)
// ---------------------------------------------------------------------------

/**
 * Payload sent when a single track listen ends (completed or skipped).
 *
 * Creates an {@link IPlaybackDoc} record on the server. The server
 * computes {@link PlaybackEventResponseDTO.completionRate} and
 * {@link PlaybackEventResponseDTO.qualifiesAsStream} from the raw
 * position / duration values.
 *
 * @example POST /playback/event
 */
export interface RecordPlaybackDTO {
    /** The session this event belongs to. */
    sessionId: string;
    /** The sermon that was played. */
    mediaItemId: string;

    /** Origin surface of the media item. */
    sourceType: MediaSourceType;
    /** Containing resource ID. */
    sourceId: string;
    /** Position of this media item within its source (e.g. track 3 of a playlist). */
    sourcePosition?: number;

    /** Track position in ms when playback began. */
    startPositionMs: number;
    /** Track position in ms when playback stopped. */
    endPositionMs: number;
    /** Total duration of the track in ms. */
    trackDurationMs: number;
    /** Actual time the listener spent listening in ms (excludes pauses/seeks). */
    listenedDurationMs: number;

    /** Whether the track played to the end. */
    completed?: boolean;
    /** Whether the listener skipped the track. */
    skipped?: boolean;
    /** Why the track was skipped, if applicable. */
    skipReason?: SkipReason;

    /** Number of times playback was paused. */
    pausedCount?: number;
    /** Number of seek operations. */
    seekCount?: number;
    /** Number of buffering stalls. */
    bufferCount?: number;
    /** Number of playback errors encountered. */
    errorCount?: number;

    /** Whether the track was played from a downloaded copy. */
    offlineMode: boolean;
}

/**
 * Server response after a playback event is recorded.
 *
 * Contains server-computed metrics that the client cannot derive
 * on its own (e.g. whether the listen qualifies as a countable stream).
 *
 * @example Response body for POST /playback/event
 */
export interface PlaybackEventResponseDTO {
    /** Playback event document ID. */
    id: string;
    /** Ratio of listened duration to track duration (0-1). */
    completionRate: number;
    /** Whether the listen meets the minimum threshold to count as a stream (e.g. >= 30 s). */
    qualifiesAsStream: boolean;
    /** Whether the track played to the end. */
    completed: boolean;
}

// ---------------------------------------------------------------------------
// Playback Media Item DTO (lightweight sermon shape for the player UI)
// ---------------------------------------------------------------------------

/**
 * Minimal minister shape embedded in {@link PlaybackMediaItemDTO}.
 *
 * Only the fields required to render the player "now playing" UI.
 */
export interface PlaybackMediaItemMinisterDTO {
    /** Minister document ID. */
    id: string;
    /** Display name (ministerial or personal). */
    name: string;
    /** Avatar CDN URL, if available. */
    avatar?: string;
}

/**
 * Minimal series shape embedded in {@link PlaybackMediaItemDTO}.
 *
 * Lets the player show which series/album a sermon belongs to.
 */
export interface PlaybackMediaItemSeriesDTO {
    /** Series document ID. */
    id: string;
    /** Series title. */
    title: string;
}

/**
 * Lightweight sermon projection for the player UI.
 *
 * Contains only the fields needed to render the "now playing" screen
 * and initialise the audio player. Prevents over-fetching the full
 * {@link ISermonDoc} (upload metadata, engagement counters, tags, etc.).
 *
 * Used by:
 * - {@link SessionResponseDTO.currentMediaItem}
 * - {@link PlaybackHistoryItemDTO.mediaItem}
 */
export interface PlaybackMediaItemDTO {
    /** Sermon document ID. */
    id: string;
    /** Short unique code. */
    code: string;
    /** URL-safe slug. */
    slug: string;

    /** Sermon title. */
    title: string;
    /** Short description / subtitle. */
    description: string;

    /** CDN URL of the cover art. */
    imageUrl: string;
    /** Signed HLS/DASH playback URL. */
    playbackUrl: string;
    /** Master playlist URL (.m3u8 or .mpd). */
    manifestUrl: string;

    /** Streaming protocol for this delivery. */
    protocol: StreamingProtocol;
    /** Quality tier. */
    quality: StreamingQuality;
    /** MIME type (e.g. `application/x-mpegURL`). */
    mimeType: string;

    /** Total duration in seconds. */
    duration: number;

    /** Minister(s) who delivered the sermon. */
    minister: PlaybackMediaItemMinisterDTO;
    /** Parent series/album, or `null` if standalone. */
    series: PlaybackMediaItemSeriesDTO | null;

    /** Whether offline download is permitted. */
    allowDownload: boolean;
    /** Whether comments are enabled. */
    allowComment: boolean;
}

// ---------------------------------------------------------------------------
// Playback History DTOs (for "Recently Played" rail)
// ---------------------------------------------------------------------------

/**
 * Single item in a listener's playback history.
 *
 * Designed for the "Recently Played" rail: lightweight enough to render
 * a scrollable list without loading full playback event documents.
 */
export interface PlaybackHistoryItemDTO {
    /** Playback event document ID. */
    id: string;
    /** Lightweight sermon data for the history card. */
    mediaItem: PlaybackMediaItemDTO;
    /** ISO-8601 timestamp of when the sermon was last played. */
    listenedAt: string;
    /** Ratio of listened duration to track duration (0-1). */
    completionRate: number;
    /** Last known position in ms -- used as the resume point. */
    currentPositionMs: number;
    /** Whether the track was played to the end. */
    completed: boolean;
}

/**
 * Paginated playback history response.
 *
 * Uses cursor-based pagination for stable iteration over a listener's
 * play history, even as new events are recorded.
 *
 * @example GET /playback/history?cursor=abc&limit=20
 */
export interface PlaybackHistoryResponseDTO {
    /** Page of history items. */
    items: PlaybackHistoryItemDTO[];
    /** Total number of playback events for this listener. */
    total: number;
    /** Whether more pages exist after the current cursor. */
    hasMore: boolean;
    /** Opaque cursor for fetching the next page. */
    cursor?: string;
}
