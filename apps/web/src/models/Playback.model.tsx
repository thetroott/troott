import Listener from './Listener.model';
import PlaybackSession from './PlaybackSession.model';
import Sermon from './Sermon.model';
import Subscription from './Subscription.model';

interface Playback {
    code: string;

    // Relationships
    session: PlaybackSession | any;
    listener: Listener;
    mediaItem: Sermon; // the media item that is being played 
    subscription: Subscription | any; // playback can change based on subscription status

    // Context
    sourceType: MediaSourceType; // the type of the source of the current media item eg. sermon, series, playlist
    sourceId: string; // the id of the source of the current media item eg. sermon id, series id, playlist id
    sourcePosition: number; // the position of the current media item in the source

    // Timing
    playedAt: string; // The time the media item was played.
    startedAt: string; // The time the media item was started.
    endedAt: string; // The time the media item was stopped.

    // Playback Settings (These are the settings of the playback session and snapshot from session at time of play)
    volume: number; // The volume at which the media item is being played.
    muted: boolean; // Whether the media item is currently muted.
    shuffle: boolean; // Whether the media item is currently shuffled.
    repeatMode: RepeatMode; // The repeat mode of the media item.

    // Position and Duration
    trackDurationMs: number;
    startPositionMs: number;
    endPositionMs: number;
    currentPositionMs: number;
    listenedDurationMs: number;
    foregroundDurationMs: number;
    bufferedDurationMs: number;

    // Completion Metrics
    completionRate: number;
    qualifiesAsStream: boolean;
    completed: boolean;
    skipped: boolean;
    skipReason: SkipReason;

    // Interaction Flags
    pausedCount: number;
    resumedCount: number;
    seekCount: number;
    replayCount: number;
    bufferCount: number;
    errorCount: number;

    sessionId: string;

    // Device Information
    deviceType: DeviceType;
    platform: PlatformType;
    deviceInfo: DeviceInfo;

    // Network and Quality
    networkType: NetworkType;
    connectionType?: ConnectionType;

    // Offline
    offlineMode: boolean;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

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
    deviceName: string; // device name eg Damola's iPhone 15 Pro Max
    device: string; // device brand
    os: string; // operating system
    browser: string; // browser name
    appVersion: string;
    osVersion: string;
    browserVersion: string;
}

export default Playback;
