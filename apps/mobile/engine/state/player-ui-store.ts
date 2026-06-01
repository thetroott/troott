import { create } from '@/lib/zstore';
import { IPlayerState } from './player-ui-types';

export const useTrackStore = create<IPlayerState>((set, get) => ({
    /** Current track */
    currentTrack: null,
    setCurrentTrack: (track) => set({ currentTrack: track }),

    /** UI states */
    showFullPlayer: false,
    setShowFullPlayer: (show) => set({ showFullPlayer: show }),
    fullPlayerReturnPath: null,
    setFullPlayerReturnPath: (path) => set({ fullPlayerReturnPath: path }),
    showMiniPlayer: true,
    setShowMiniPlayer: (show) => set({ showMiniPlayer: show }),

    /** Playback state */
    trackPlaying: false,
    setTrackPlaying: (playing) => set({ trackPlaying: playing }),
    play: () => set({ trackPlaying: true }),
    pause: () => set({ trackPlaying: false }),
    stop: () => {
        set({ trackPlaying: false, currentTime: 0 });
    },
    togglePlayPause: () => set({ trackPlaying: !get().trackPlaying }),

    /** Progress tracking */
    currentTime: 0,
    setCurrentTime: (time) => {
        const { duration } = get();
        const clamped = Math.max(
            0,
            Math.min(time, duration || Number.MAX_SAFE_INTEGER),
        );
        set({
            currentTime: clamped,
            progress: duration ? clamped / duration : 0,
        });
    },
    duration: 0,
    setDuration: (duration) => {
        const { currentTime } = get();
        const clampedTime = Math.max(
            0,
            Math.min(currentTime, duration || Number.MAX_SAFE_INTEGER),
        );
        set({
            duration,
            currentTime: clampedTime,
            progress: duration ? clampedTime / duration : 0,
        });
    },
    seekTo: (time) => {
        // This only updates state. Your player element should listen to this and seek.
        const { duration } = get();
        const clamped = Math.max(
            0,
            Math.min(time, duration || Number.MAX_SAFE_INTEGER),
        );
        set({
            currentTime: clamped,
            progress: duration ? clamped / duration : 0,
        });
    },
    progress: 0,
    setProgress: (progress) => {
        const { duration } = get();
        const clamped = Math.max(0, Math.min(progress, 1));
        set({
            progress: clamped,
            currentTime: duration ? clamped * duration : 0,
        });
    },

    /** Queue & history */
    queue: [],
    setQueue: (tracks) => set({ queue: tracks }),
    addToQueue: (track) => set({ queue: [...get().queue, track] }),
    removeFromQueue: (trackId) =>
        set({ queue: get().queue.filter((t) => t.id !== trackId) }),
    clearQueue: () => set({ queue: [] }),

    history: [], // list of previously played tracks
    addToHistory: (track) => set({ history: [...get().history, track] }),
    clearHistory: () => set({ history: [] }),

    /** Playback settings */
    repeatMode: 'off',
    setRepeatMode: (mode) => set({ repeatMode: mode }),
    shuffle: false,
    setShuffle: (shuffle) => set({ shuffle }),

    /** Volume & speed */
    volume: 1,
    setVolume: (volume) => set({ volume }),
    muted: false,
    setMuted: (muted) => set({ muted }),
    playbackRate: 1,
    setPlaybackRate: (rate) => set({ playbackRate: rate }),

    // user preferences
    liked: false,
    setLiked: (val) => set({ liked: val }),
    disliked: false,
    setDisliked: (val) => set({ disliked: val }),
    bookmarked: false,
    setBookmarked: (val) => set({ bookmarked: val }),
    rating: 0, // 1 to 5
    setRating: (val) => set({ rating: val }),

    /** Bookmarks */
    bookmarks: {},
    addBookmark: (trackId, time) =>
        set((state) => ({
            bookmarks: { ...state.bookmarks, [trackId]: time },
        })),
    removeBookmark: (trackId) =>
        set((state) => {
            const { [trackId]: _, ...rest } = state.bookmarks;
            return { bookmarks: rest };
        }),
    restoreBookmark: (trackId) => get().bookmarks[trackId],

    /**Toggle Player */
    isFullPlayer: false,
    setIsFullPlayer: (isFull) => set({ isFullPlayer: isFull }),

    /** Playback metadata */
    currentChapter: null,
    setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
    timedMetadata: [],
    addTimedMetadata: (meta) =>
        set({ timedMetadata: [...get().timedMetadata, meta] }),

    /** Metadata & status */
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    error: undefined,
    setError: (error) => set({ error }),
    lyrics: undefined,
    setLyrics: (lyrics) => set({ lyrics }),
}));

// prevTrack: () => {
//   const { history, currentTrack, queue, repeatMode } = get();

//   // repeat one just restart
//   if (repeatMode === "one" && currentTrack) {
//     set({ currentTime: 0, trackPlaying: true });
//     return;
//   }

//   if (!history.length) {
//     // no history means restart current track
//     if (currentTrack) {
//       set({ currentTime: 0, trackPlaying: true });
//     }
//     return;
//   }

//   const lastPlayed = history[history.length - 1];
//   const newHistory = history.slice(0, -1);
//   const newQueue = currentTrack ? [currentTrack, ...queue] : queue;

//   set({
//     currentTrack: lastPlayed,
//     history: newHistory,
//     queue: newQueue,
//     currentTime: 0,
//     trackPlaying: true,
//   });
// },

/** Navigation with shuffle and repeat support */
//  nextTrack: () => {
//   const {
//     queue,
//     currentTrack,
//     addToHistory,
//     repeatMode,
//     shuffle,
//     history,
//   } = get();

//   if (repeatMode === "one" && currentTrack) {
//     set({ currentTime: 0, trackPlaying: true });
//     return;
//   }

//   // Move current track to history if it exists
//   if (currentTrack) addToHistory(currentTrack);

//   let next: typeof currentTrack | null = null;
//   let remainingQueue = [...queue];

//   if (remainingQueue.length === 0) {
//     if (repeatMode === "all") {
//       remainingQueue = [...history];
//       set({ history: [] });
//     } else {
//       // nothing to play
//       return;
//     }
//   }

//   if (shuffle && remainingQueue.length > 0) {
//     const idx = Math.floor(Math.random() * remainingQueue.length);
//     next = remainingQueue[idx];
//     remainingQueue.splice(idx, 1);
//   } else {
//     next = remainingQueue.shift() || null;
//   }

//   set({
//     currentTrack: next,
//     queue: remainingQueue,
//     currentTime: 0,
//     trackPlaying: !!next,
//   });
// },
