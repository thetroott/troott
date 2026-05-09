export interface PlaybackState {
    currentTrackId: string | null;
    isPlaying: boolean;
    positionMs: number;
    durationMs: number;
    repeatMode: number;
    shuffle: boolean;
    volume: number;
    muted: boolean;
    playbackRate: number;
    crossfadeMs: number;
    currentDeviceId: string | null;
    sleepTimerEndsAt: string | null;
    isBuffering: boolean;
    error: string | null;
    resumePoints: Record<
        string,
        { positionMs: number; durationMs: number; updatedAt: string }
    >;
    lyrics: unknown;
    lyricsCursorMs: number;
    chapters: Record<string, unknown[]>;
    currentChapterId: string | null;
    bookmarks: Record<string, unknown[]>;
    timedMetadata: unknown[] | null;
}

export type PlaybackAction =
    | { type: 'SYNC_PLAYBACK_BRIDGE'; payload: Partial<PlaybackState> }
    | {
          type: 'SET_RESUME_POINT';
          payload: {
              trackId: string;
              positionMs: number;
              durationMs: number;
              updatedAt: string;
          };
      }
    | { type: string; payload?: unknown };
