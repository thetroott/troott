import { Document, Types } from 'mongoose';
import IListenerDoc from './listener.interface';
import {
    ConnectionType,
    DeviceInfo,
    DeviceType,
    MediaSourceType,
    NetworkType,
    PlatformType,
    RepeatMode,
} from './playback.interface';
import ISermonDoc from './sermon.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a long-lived playback session.
 *
 * A session spans the entire time a listener has audio active on a
 * device -- from pressing play to explicitly stopping or the heartbeat
 * timing out. Multiple {@link IPlaybackDoc} events are recorded under
 * one session as the listener moves through a queue.
 *
 * Supports cross-device transfer via {@link transferredFromSessionId}
 * and optimistic concurrency via {@link syncVersion}.
 */
interface IPlaybackSessionDoc extends Document {
    /** Short unique code. */
    code: string;

    /** The sermon currently loaded in the player (includes streaming fields). */
    currentMediaItem: ISermonDoc | any;
    /** Origin surface that triggered this session. */
    sourceType: MediaSourceType;
    /** ID of the source resource (e.g. playlist ID, series ID). */
    sourceId: string;

    /** The listener who owns this session. */
    listener: IListenerDoc | any;

    /** Reference to the queue document driving playback order. */
    queueRef: string;
    /** Whether the queue order has been shuffled. */
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
    /** Playback speed multiplier (e.g. 1.0, 1.5, 2.0). */
    playbackRate: number;
    /** Repeat behaviour. */
    repeatMode: RepeatMode;

    /** Device category. */
    deviceType: DeviceType;
    /** Operating system / runtime platform. */
    platform: PlatformType;
    /** Rich device metadata. */
    deviceInfo: DeviceInfo;

    /** Network transport. */
    networkType: NetworkType;
    /** Cellular generation, when applicable. */
    connectionType: ConnectionType;

    /** Whether the listener is playing from a downloaded copy. */
    offlineMode: boolean;

    /** ISO-8601 timestamp when the session started. */
    startedAt: string;
    /** ISO-8601 timestamp of the most recent heartbeat (proves the listener is still active). */
    lastHeartbeatAt: string;
    /** ISO-8601 timestamp when the session ended. */
    endedAt: string;
    /** Whether the session is still active. */
    isActive: boolean;

    /** Monotonically increasing version for cross-device conflict resolution. */
    syncVersion: number;
    /** Device ID of the device that last updated this session. */
    updatedByDeviceId: string;
    /** Session ID this session was transferred from (device handoff). */
    transferredFromSessionId?: string;

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

export default IPlaybackSessionDoc;
