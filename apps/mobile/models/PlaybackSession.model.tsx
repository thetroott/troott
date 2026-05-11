import Listener from './Listener.model';
import {
    ConnectionType,
    DeviceInfo,
    DeviceType,
    MediaSourceType,
    NetworkType,
    PlatformType,
    RepeatMode,
} from './Playback.model';
import Playlist from './Playlist.model';
import Series from './Series.model';
import Sermon from './Sermon.model';

interface PlaybackSession {
    code: string;
    currentMediaItem: Sermon | Series | Playlist;

    // Relationships
    listener: Listener | any; // the listener who is playing the media

    // Context
    sourceType: MediaSourceType; // what is the source of the current media item?
    sourceId: string; // the id of the source of the current media item eg. sermon id, series id, playlist id

    // Queue

    queueRef: string; // the reference to the queue that is playing the media items
    queueShuffled: boolean;
    queueIndex: number;

    // Playback state
    isPlaying: boolean; // is the media item currently playing?
    isPaused: boolean; // is the media item currently paused?
    isBuffering: boolean; // is the media item currently buffering?
    volume: number; // The volume at which the media item is being played.
    muted: boolean; // Whether the media item is currently muted.
    shuffle: boolean; // Whether the media item is currently shuffled.
    playbackRate: number; // The rate at which the media item is being played
    repeatMode: RepeatMode; // The repeat mode of the media item.

    // Device Information
    deviceType: DeviceType;
    platform: PlatformType;
    deviceInfo: DeviceInfo;

    // Network
    networkType?: NetworkType;
    connectionType?: ConnectionType;

    // Offline
    offlineMode: boolean;

    // Lifecycle
    startedAt: string; // The time the session was started.
    lastHeartbeatAt: string; // The time the session was last heartbeat. User still here and active
    endedAt: string; // The time the session was ended.
    isActive: boolean; // Whether the session is currently active.

    // Synchronization
    syncVersion: number; // Prevents race conditions across devices.
    updatedByDeviceId: string; // The device ID of the device that updated the session.
    transferredFromSessionId?: string; // The session ID of the session that transferred the session.

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export enum MediaQuality {
  LOW = 'low',
  HIGH = 'high',
  LOSSLESS = 'lossless',
}

export default PlaybackSession;


// we can have an entitlement model