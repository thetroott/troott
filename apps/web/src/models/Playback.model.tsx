import { MediaSourceType, SkipReason } from '@/dtos/playback.dto';

export interface Playback {
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
    id?: string;
    completionRate?: number;
    qualifiesAsStream?: boolean;
    code?: string;
    listener?: unknown;
    session?: unknown;
    mediaItem?: unknown;
    subscription?: unknown;
    playedAt?: string;
    startedAt?: string;
    endedAt?: string;
    foregroundDurationMs?: number;
    bufferedDurationMs?: number;
    resumedCount?: number;
    replayCount?: number;
    mediaId?: string;
    mediaType?: MediaSourceType;
    createdAt?: string;
    updatedAt?: string;
    _version?: number;
    _id?: string;
}

export default Playback;
