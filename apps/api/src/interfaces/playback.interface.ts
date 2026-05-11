import { Document, Types } from 'mongoose';
import IListenerDoc from './listener.interface';
import IPlaybackSessionDoc from './playback-session.interface';
import ISermonDoc from './sermon.interface';
import ISubscriptionDoc from './subscription.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a single playback event.
 *
 * Every time a listener plays (or partially plays) a sermon, one
 * `IPlaybackDoc` is created. It captures position, duration,
 * completion metrics, interaction counts, and device/network context
 * at the moment of playback.
 *
 * Multiple playback events can belong to the same
 * {@link IPlaybackSessionDoc} (e.g. when a listener plays through a
 * queue of sermons in a single sitting).
 *
 * Server-side logic uses `listenedDurationMs` and `trackDurationMs` to
 * compute {@link completionRate} and {@link qualifiesAsStream}.
 */
interface IPlaybackDoc extends Document {
    /** Short unique code. */
    code: string;

    /** The session this event belongs to. */
    session: IPlaybackSessionDoc | any;
    /** The listener who played the sermon. */
    listener: IListenerDoc;
    /** The sermon that was played. */
    mediaItem: ISermonDoc;
    /** Active subscription at time of playback (affects entitlements). */
    subscription: ISubscriptionDoc | any;

    /** Origin surface that triggered playback (e.g. library, search, playlist). */
    sourceType: MediaSourceType;
    /** ID of the containing resource (e.g. playlist ID, series ID). */
    sourceId: string;
    /** Position of the media item within its source (e.g. track 3 of a playlist). */
    sourcePosition: number;

    // Media Identity
    /** Raw media identifier. */
    mediaId: string;
    /** Type of media being played. */
    mediaType: MediaSourceType;

    /** ISO-8601 timestamp when the sermon was played. */
    playedAt: string;
    /** ISO-8601 timestamp when playback started. */
    startedAt: string;
    /** ISO-8601 timestamp when playback stopped. */
    endedAt: string;

    /** Volume level at time of play (0-1). */
    volume: number;
    /** Whether playback was muted. */
    muted: boolean;
    /** Whether shuffle mode was on. */
    shuffle: boolean;
    /** Repeat mode at time of play. */
    repeatMode: RepeatMode;

    /** Total track duration in milliseconds. */
    trackDurationMs: number;
    /** Track position (ms) when playback began. */
    startPositionMs: number;
    /** Track position (ms) when playback ended. */
    endPositionMs: number;
    /** Last known cursor position in ms. */
    currentPositionMs: number;
    /** Actual listened time in ms (excludes pauses and seeks). */
    listenedDurationMs: number;
    /** Time the app was in the foreground during playback (ms). */
    foregroundDurationMs: number;
    /** Amount of audio buffered ahead of the cursor (ms). */
    bufferedDurationMs: number;

    /** Ratio of `listenedDurationMs` to `trackDurationMs` (0-1). */
    completionRate: number;
    /** Whether the listen meets the minimum threshold to count as a stream (e.g. >= 30 s). */
    qualifiesAsStream: boolean;
    /** Whether the track played to the end. */
    completed: boolean;
    /** Whether the listener skipped the track. */
    skipped: boolean;
    /** Reason the track was skipped, if applicable. */
    skipReason: SkipReason;

    /** Number of times playback was paused. */
    pausedCount: number;
    /** Number of times playback was resumed after a pause. */
    resumedCount: number;
    /** Number of seek operations. */
    seekCount: number;
    /** Number of times the track was replayed from the start. */
    replayCount: number;
    /** Number of buffering stalls. */
    bufferCount: number;
    /** Number of playback errors encountered. */
    errorCount: number;

    /** Denormalised session ID for fast queries. */
    sessionId: string;

    /** Device category. */
    deviceType: DeviceType;
    /** Operating system / runtime platform. */
    platform: PlatformType;
    /** Rich device metadata. */
    deviceInfo: DeviceInfo;

    /** Network transport during playback. */
    networkType: NetworkType;
    /** Cellular generation, when applicable. */
    connectionType?: ConnectionType;

    /** Whether the track was played from a downloaded copy. */
    offlineMode: boolean;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** Queue repeat behaviour. */
export enum RepeatMode {
    /** No repeat. */
    OFF = 'off',
    /** Repeat the current track. */
    ONE = 'one',
    /** Repeat the entire queue. */
    ALL = 'all',
}

/** Streaming protocol (playback-layer mirror of the sermon interface enum). */
export enum StreamingProtocol {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
}

/** Quality tier (playback-layer mirror of the sermon interface enum). */
export enum StreamingQuality {
    AUTO = 'auto',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    LOSSLESS = 'lossless',
}

/** Network transport type at the time of playback. */
export enum NetworkType {
    WIFI = 'wifi',
    CELLULAR = 'cellular',
    ETHERNET = 'ethernet',
    OFFLINE = 'offline',
}

/** Cellular network generation (only relevant when {@link NetworkType} is `CELLULAR`). */
export enum ConnectionType {
    _2G = '2g',
    _3G = '3g',
    _4G = '4g',
    _5G = '5g',
}

/** Surface or context that triggered playback. */
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

/** Physical device category. */
export enum DeviceType {
    MOBILE = 'mobile',
    WEB = 'web',
    DESKTOP = 'desktop',
}

/** Operating system or runtime environment. */
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

/** Why a track was skipped before completion. */
export enum SkipReason {
    /** Listener explicitly pressed skip. */
    MANUAL = 'manual',
    /** Auto-advance to the next track. */
    NEXT = 'next',
    /** Listener went back to the previous track. */
    PREVIOUS = 'previous',
    /** Listener seeked past the end. */
    SEEK = 'seek',
    /** App was closed or backgrounded. */
    APP_CLOSED = 'app_closed',
    /** Playback stopped due to a network error. */
    NETWORK_ERROR = 'network_error',
    /** Playback stopped due to an audio decoding error. */
    AUDIO_ERROR = 'audio_error',
    /** Another audio source interrupted playback (e.g. phone call). */
    INTERRUPTED = 'interrupted',
    /** Playback moved to a different device. */
    DEVICE_TRANSFER = 'device_transfer',
}

/** Rich device metadata captured at playback time. */
export interface DeviceInfo {
    /** User-facing device name (e.g. `Damola's iPhone 15 Pro Max`). */
    deviceName: string;
    /** Device brand / manufacturer. */
    device: string;
    /** Operating system name. */
    os: string;
    /** Browser name (web clients). */
    browser: string;
    /** Application version string. */
    appVersion: string;
    /** OS version string. */
    osVersion: string;
    /** Browser version string (web clients). */
    browserVersion: string;
}

export default IPlaybackDoc;
