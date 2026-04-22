import { ISermonTrack } from '@/dtos/sermon.dto';
import type { MetadataReceivedEvent } from '@rntp/player';

type Track = Partial<ISermonTrack>;
export type Chapter = MetadataReceivedEvent;
export type TimedMeta = { value: string; time: number };

export interface IPlayerState {
    /** Current track being played or selected */
    currentTrack: Track | null;
    setCurrentTrack: (track: Track | null) => void;

    /** UI states */
    showFullPlayer: boolean;
    setShowFullPlayer: (show: boolean) => void;
    /** Where to return when closing full player (captured when opening from mini, e.g. `/(tabs)/library`). */
    fullPlayerReturnPath: string | null;
    setFullPlayerReturnPath: (path: string | null) => void;
    showMiniPlayer: boolean;
    setShowMiniPlayer: (show: boolean) => void;

    /** Playback state */
    trackPlaying: boolean;
    setTrackPlaying: (playing: boolean) => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    togglePlayPause: () => void;

    /** Progress tracking */
    currentTime: number; // seconds
    setCurrentTime: (time: number) => void;
    duration: number; // seconds
    setDuration: (duration: number) => void;
    seekTo: (time: number) => void;
    progress: number; // 0 to 1 (percentage)
    setProgress: (progress: number) => void;

    /** Queue management */
    queue: Track[];
    setQueue: (tracks: Track[]) => void;
    addToQueue: (track: Track) => void;
    removeFromQueue: (trackId: string) => void;

    /** Playback history */
    history: Track[];
    addToHistory: (track: Track) => void;

    /** Navigation */
    nextTrack?: () => void;
    prevTrack?: () => void;

    /** Playback settings */
    repeatMode: 'off' | 'one' | 'all';
    setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
    shuffle: boolean;
    setShuffle: (shuffle: boolean) => void;

    /** Volume & speed */
    volume: number; // 0 to 1
    setVolume: (volume: number) => void;
    muted: boolean;
    setMuted: (muted: boolean) => void;
    playbackRate: number; // 0.5 to 2.0
    setPlaybackRate: (rate: number) => void;

    /** User preferences */
    liked: boolean;
    disliked: boolean;
    setLiked: (val: boolean) => void;
    setDisliked: (val: boolean) => void;
    bookmarked: boolean;
    setBookmarked: (val: boolean) => void;
    rating: number; // 1 to 5
    setRating: (rating: number) => void;

    /** Bookmarks */
    bookmarks: Record<string, number>; // trackId -> timestamp
    addBookmark: (trackId: string, time: number) => void;
    removeBookmark: (trackId: string) => void;
    restoreBookmark: (trackId: string) => number | undefined;

    /** Toggle Player */
    isFullPlayer: boolean;
    setIsFullPlayer: (isFull: boolean) => void;

    /** Playback metadata */
    currentChapter: Chapter | null;
    setCurrentChapter: (chapter: Chapter | null) => void;
    timedMetadata: TimedMeta[];
    addTimedMetadata: (meta: TimedMeta) => void;

    /** Metadata & status */
    isLoading: boolean;
    setIsLoading: (buffering: boolean) => void;
    error?: string;
    setError: (error: string | undefined) => void;
    lyrics?: string;
    setLyrics: (lyrics: string | undefined) => void;
}
