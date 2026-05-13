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
import Sermon from './Sermon.model';

interface PlaybackSession {
    code: string;
    currentMediaItem: Sermon | any;

    listener: Listener | any;

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
    deviceInfo: DeviceInfo;

    networkType?: NetworkType;
    connectionType?: ConnectionType;

    offlineMode: boolean;

    startedAt: string;
    lastHeartbeatAt: string;
    endedAt: string;
    isActive: boolean;

    syncVersion: number;
    updatedByDeviceId: string;
    transferredFromSessionId?: string;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default PlaybackSession;
