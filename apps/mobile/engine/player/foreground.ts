// import TrackPlayer, { Event, RepeatMode as Rend, State } from "react-native-track-player";
// import { useTrackStore } from "@/stores/player-store";

// import { useEffect, useRef } from "react";
// import { SermonTrackDTO as ISermonTrack  } from "@/dtos/sermon.dto";
// import type { Track } from "react-native-track-player";

// type RepeatMode = "off" | "one" | "all";
// type PlayerCallback<T> = (payload: T) => void;

// interface PlayerServiceOptions {
//   onTrackChange?: PlayerCallback<ISermonTrack | null>;
//   onProgress?: PlayerCallback<{
//     position: number;
//     duration: number;
//     buffered?: number;
//   }>;
//   onQueueChanged?: PlayerCallback<ISermonTrack[]>;
//   onMetadataChanged?: PlayerCallback<any>;
//   onError?: PlayerCallback<Error>;

//   // new features to be implemented
//   debug?: boolean; // new optional flag
//   onLoad?: () => void; // Callback when player setup is complete
//   onAnalytics?: (eventName: string, payload?: any) => void;
// }

// export class PlayerService {
//   private options: PlayerServiceOptions;
//   private subs: Array<{ remove?: () => void }> = [];
//   private originalQueue: Track[] = [];
//   private subscriptions: (() => void)[] = [];

//   /**
//    * @name constructor
//    * @description Initializes a new PlayerService instance with optional callbacks
//    * for track changes, progress updates, and error handling. Automatically registers
//    * internal event listeners for TrackPlayer and syncs with Zustand's track store.
//    *
//    * @param {PlayerServiceOptions} [options] - Optional configuration for callbacks.
//    * @sideeffect Registers TrackPlayer event listeners and starts tracking playback state.
//    * @example
//    * const player = new PlayerService({ onTrackChange: handleTrackChange });
//    * @access Public
//    */
//   constructor(options?: PlayerServiceOptions) {
//     this.options = options ?? {};
//     this.registerEvents();
//   }

//   /**
//    * @name destroy
//    * @description Cleans up all event listeners registered with TrackPlayer to prevent
//    * memory leaks or duplicated events when re-instantiating PlayerService.
//    *
//    * @returns {void}
//    * @sideeffect Removes all registered TrackPlayer subscriptions.
//    * @example
//    * player.destroy(); // Release resources before component unmount
//    * @access Public
//    */
//   destroy() {
//     this.subs.forEach((s) => s.remove?.());
//     this.subs = [];
//   }

//   /**
//    * @name registerEvents
//    * @description Private method that wires up internal TrackPlayer event listeners
//    * to sync player state with Zustand store and trigger configured callbacks.
//    * Handles playback state, progress updates, track changes, queue end, and errors.
//    *
//    * @private
//    * @returns {void}
//    * @sideeffect Mutates Zustand store state and may invoke `onError` and `onTrackChange`.
//    * @see TrackPlayer.addEventListener
//    * @see https://rntp.dev/docs/api/events
//    */
//   async registerEvents() {
//     const store = useTrackStore.getState();

//     // Playback state
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
//         store.setIsLoading([State.Buffering, State.Loading].includes(state));
//         store.setTrackPlaying(state === State.Playing);
//       })
//     );

//     // Progress tracking (throttled)
//     let lastUpdate = 0;
//     this.subs.push(
//       TrackPlayer.addEventListener(
//         Event.PlaybackProgressUpdated,
//         ({ position, duration, buffered }) => {
//           const now = Date.now();
//           if (now - lastUpdate > 250) {
//             lastUpdate = now;
//             store.setCurrentTime(position);
//             store.setDuration(duration);
//             this.options.onProgress?.({ position, duration, buffered });
//           }
//         }
//       )
//     );

//     // Track change
//     // Track change listener
// this.subs.push(
//   TrackPlayer.addEventListener(
//     Event.PlaybackActiveTrackChanged,
//     async ({ track }) => {
//       const prevTrack = store.currentTrack;

//       // 1. Handle history
//       if (prevTrack && track && prevTrack.id !== track.id) {
//         store.addToHistory(prevTrack);
//       }

//       // 2. Update current track
//       store.setCurrentTrack(track ?? null);

//       // 3. Handle repeat mode (separate concern)
//       if (store.repeatMode === "all") {
//         await this.ensureRepeatAllSentinel();
//       }

//       // 4. Call external onTrackChange callback
//       this.options.onTrackChange?.(track ?? null);
//     }
//   )
// );

//     // Queue ended
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
//         if (store.repeatMode === "all" && this.originalQueue.length > 0) {
//           await this.loopQueue();
//         } else {
//           await this.stop();
//         }
//       })
//     );

//     // Playback errors
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.PlaybackError, ({ code, message }) => {
//         const err = new Error(`${code}: ${message}`);
//         store.setError(err.message);
//         this.options.onError?.(err);
//       })
//     );

//     // Remote Controls
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemotePlay, async () => this.play())
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemotePause, async () => this.pause())
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemoteStop, async () => this.stop())
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemoteNext, async () =>
//         this.skipToNext()
//       )
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemotePrevious, async () =>
//         this.skipToPrevious()
//       )
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(
//         Event.RemoteJumpForward,
//         async ({ interval }) => {
//           const store = useTrackStore.getState();
//           await this.seekTo(store.currentTime + interval);
//         }
//       )
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(
//         Event.RemoteJumpBackward,
//         async ({ interval }) => {
//           const store = useTrackStore.getState();
//           await this.seekTo(Math.max(0, store.currentTime - interval));
//         }
//       )
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }) =>
//         this.seekTo(position)
//       )
//     );
//     this.subs.push(
//       TrackPlayer.addEventListener(
//         Event.RemoteDuck,
//         async ({ paused, permanent }) => {
//           const store = useTrackStore.getState();

//           if (permanent) {
//             // Permanent interruptions: stop playback entirely
//             await TrackPlayer.stop();
//             store.pause();
//             store.setMuted(true);
//             return;
//           }

//           if (paused) {
//             // Temporary interruption: pause playback
//             await TrackPlayer.pause();
//             store.pause();
//           } else {
//             // Interruption ended: resume playback
//             await TrackPlayer.play();
//             store.play();
//           }
//         }
//       )
//     );

//     // Remote Remote ratings / like / bookmark
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemoteLike, () => {
//         //store.setRating(rating); // update rating
//         store.setLiked(true); // mark track as liked
//         store.setDisliked(false); // remove dislike if any
//         console.log("Track liked!");
//       })
//     );

//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemoteDislike, () => {
//         store.setLiked(false); // remove like
//         store.setDisliked(true); // mark track as disliked
//         console.log("Track disliked!");
//       })
//     );

//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemoteSetRating, ({ rating }) => {
//         store.setRating(rating); // just update rating
//         console.log("Track rating set:", rating);
//       })
//     );

//     // inside registerEvents()
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.RemotePlayId, async ({ id }) => {
//         const store = useTrackStore.getState();
//         if (!id) return;

//         // find track in queue or library
//         const queue = await TrackPlayer.getQueue(); // cant i use my set queue?

//         const trackIndex = queue.findIndex((t) => t.id === id);
//         if (trackIndex >= 0) {
//           await TrackPlayer.skip(trackIndex);
//           await TrackPlayer.play();
//           store.setCurrentTrack(queue[trackIndex]);
//           store.play();
//         } else {
//           console.warn("Track ID not found:", id);
//         }
//       })
//     );

//     this.subs.push(
//       TrackPlayer.addEventListener(
//         Event.RemotePlaySearch,
//         async ({ query }) => {
//           const store = useTrackStore.getState();
//           if (!query) return;

//           // simple search example: title, artist match
//           const queue = await TrackPlayer.getQueue();
//           const track = queue.find(
//             (t) =>
//               t.title?.toLowerCase().includes(query.toLowerCase()) ||
//               t.artist?.toLowerCase().includes(query.toLowerCase())
//           );

//           if (track) {
//             const idx = queue.findIndex((t) => t.id === track.id);
//             if (idx >= 0) {
//               await TrackPlayer.skip(idx);
//               await TrackPlayer.play();
//               store.setCurrentTrack(track);
//               store.play();
//             }
//           } else {
//             console.warn("No track found for search query:", query);
//           }
//         }
//       )
//     );

//     // Metadata Events
//     this.subs.push(
//       TrackPlayer.addEventListener(Event.MetadataChapterReceived, (event) => {
//         store.setCurrentChapter(event);
//       })
//     );

//     this.subs.push(
//       TrackPlayer.addEventListener(Event.MetadataTimedReceived, (event) => {
//         console.log("MetadataTimedReceived:", event);
//       })
//     );

//     this.subs.push(
//       TrackPlayer.addEventListener(
//         Event.MetadataCommonReceived,
//         async (event) => {
//           const activeTrack = await TrackPlayer.getActiveTrack();
//           if (activeTrack) {
//             await TrackPlayer.updateNowPlayingMetadata({
//               title: activeTrack.title,
//               artist: event.metadata.artist || activeTrack.artist,
//               artwork: activeTrack.artwork,
//             });
//           }
//         }
//       )
//     );
//   }

//   /**
//  * @name playTrack - Plays a specified sermon track.
//  *
//  * @description
//  * This function handles two main scenarios:
//  * 1. If the selected track is already the currently active track, it toggles playback (play/pause).
//  * 2. If the selected track is a new track, it resets the player queue, adds the new track, and begins playback.
//  * @param {ISermonTrack} track The sermon track to be played.
//  * @returns {Promise<void>} A promise that resolves when the operation is complete.
//  * @public
//  * @async
//  */
//   public async playTrack(track: ISermonTrack) {
//     const store = useTrackStore.getState();

//     try {
//       // Check if the active track id equals this track's id. `getActiveTrack()` often
//       // returns the active track id (number/string) depending on RNTP version.
//       const activeTrackId = await TrackPlayer.getActiveTrack();
//       const activeIdStr = activeTrackId != null ? String(activeTrackId) : null;
//       const trackIdStr = track.id != null ? String(track.id) : null;

//       // Determine playback state using getState() when available.
//       const playbackStateValue = typeof TrackPlayer.getState === "function"
//         ? await TrackPlayer.getState()
//         : (await TrackPlayer.getPlaybackState())?.state;

//       if (activeIdStr && trackIdStr && activeIdStr === trackIdStr) {
//         // If the same track is clicked again, toggle play/pause.
//         if (playbackStateValue === State.Playing) {
//           await TrackPlayer.pause();
//           store.setTrackPlaying(false);
//         } else {
//           await TrackPlayer.play();
//           store.setTrackPlaying(true);
//         }
//       } else {
//         // If it's a new track, reset the player and add the new one.
//         await TrackPlayer.reset();

//         const trackToAdd: Track = {
//           id: String(track.id),
//           url: (track.url ?? (track as any).sermon) as string,
//           title: track.title ?? "",
//           artist: track.artist ?? (track as any).minister,
//           artwork: track.artwork ?? (track as any).image,
//           duration: track.duration as any,
//         };

//         await TrackPlayer.add([trackToAdd]);

//         // Update store state immediately
//         store.setCurrentTrack({
//           ...track,
//           url: trackToAdd.url,
//           artwork: trackToAdd.artwork,
//           artist: trackToAdd.artist,
//         } as ISermonTrack);
//         store.setShowMiniPlayer(true);
//         store.setTrackPlaying(true);

//         // Start playing
//         await TrackPlayer.play();
//       }
//     } catch (error) {
//       console.error("Error in playTrack:", error);
//       store.setError(`Failed to play track: ${error}`);
//     }
//   }

//   /**
//    * @name setQueue
//    * @description Sets the entire playback queue, replacing any existing tracks in TrackPlayer.
//    * Optionally skips to a specific starting index and ensures repeat-all sentinel logic
//    * is applied when repeat mode is "all".
//    *
//    * @param {Track[]} tracks - List of tracks to set as the new queue.
//    * @param {number} [startIndex=0] - Index of the track to start playback from.
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to reset or add the queue.
//    * @sideeffect Updates Zustand store queue, current track, and playback position.
//    * @example
//    * await player.setQueue(myTracks, 2); // Starts from third track
//    * @access Public
//    */
//   async setQueue(tracks: Track[], startIndex = 0) {
//     const store = useTrackStore.getState();

//     try {
//       this.originalQueue = tracks.slice();
//       store.setQueue(tracks);
//       store.setCurrentTime(0);
//       store.setDuration(0);

//       await TrackPlayer.reset();
//       await TrackPlayer.add(tracks);
//       this.options.onQueueChanged?.(tracks);

//       if (store.repeatMode === "all") {
//         await this.ensureRepeatAllSentinel();
//       }

//       if (tracks[startIndex]) {
//         await TrackPlayer.skip(startIndex);
//         store.setCurrentTrack(tracks[startIndex]);
//       }
//     } catch (err: any) {
//       store.setError(err);
//       this.options.onError?.(err);
//     }
//   }

//   /**
//    * @name ensureRepeatAllSentinel
//    * @description Private helper that ensures an extra clone of the first track
//    * is appended at the end of the queue when repeat mode is "all". This prevents
//    * TrackPlayer from stopping at the queue end and enables seamless looping.
//    *
//    * @private
//    * @returns {Promise<void>}
//    * @sideeffect Adds a duplicate track to TrackPlayer if conditions are met.
//    * @see setQueue
//    */
//   private async ensureRepeatAllSentinel() {
//     const store = useTrackStore.getState();
//     if (store.repeatMode !== "all" || !this.originalQueue.length) return;

//     const q = await TrackPlayer.getQueue();
//     const first = this.originalQueue[0];
//     if (!first) return;

//     const activeIndex = await TrackPlayer.getActiveTrackIndex();
//     const lastOriginalIndex = this.originalQueue.length - 1;

//     if (activeIndex === lastOriginalIndex) {
//       const clone: Track = {
//         ...first,
//         id: `${first.id}__loopclone__${Date.now()}`,
//       };
//       await TrackPlayer.add([clone]);
//     }
//   }

//   /**
//    * @name loopQueue
//    * @description Restarts the queue from the beginning when repeat mode is "all"
//    * and the end of the playlist is reached. Immediately resumes playback.
//    *
//    * @private
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to skip or play.
//    * @sideeffect Resets position, restarts playback, and re-applies repeat sentinel.
//    */
//   private async loopQueue() {
//     const store = useTrackStore.getState();
//     try {
//       await TrackPlayer.skip(0);
//       store.setCurrentTime(0);
//       await TrackPlayer.play();
//       store.play();
//       await this.ensureRepeatAllSentinel();
//     } catch (err: any) {
//       store.setError(err);
//       this.options.onError?.(err);
//     }
//   }

//   async getPlaybackState() {
//       try {
//         const state = typeof TrackPlayer.getState === "function"
//           ? await TrackPlayer.getState()
//           : (await TrackPlayer.getPlaybackState())?.state;
//         return state;
//       } catch (error) {
//         console.error("Error getting playback state:", error);
//         return null;
//       }
// }

// async isTrackPlaying() {
//   try {
//     const playbackState = (await TrackPlayer.getPlaybackState()).state;
//     return playbackState === State.Playing;
//   } catch (error) {
//     console.error("Error checking playback state:", error);
//     return false;
//   }
// }

// async isTrackPaused() {
//   try {
//     const playbackState = (await TrackPlayer.getPlaybackState()).state;
//     return playbackState === State.Paused;
//   } catch (error) {
//     console.error("Error checking playback state:", error);
//     return false;
//   }
// }

// async getTrackState(){
//     try {
//         const playbackState = await TrackPlayer.getPlaybackState();
//         return playbackState.state;
//     } catch (error) {
//         console.error("Error getting track state:", error);
//         return null;
//     }
// }

// async pauseButton() {
//   try {
//     console.log(await TrackPlayer.getPlaybackState(), "state");
//     await TrackPlayer.pause();
//   } catch (error) {
//     console.error("Error pausing track:", error);
//   }
// }
// async skipToNextButton() {
//   try {
//     await TrackPlayer.skipToNext();
//     await TrackPlayer.play();
//   } catch (error) {
//     console.error("Error skipping to next track:", error);
//   }
// }
// async skipToPreviousButton() {
//   try {
//     await TrackPlayer.skipToPrevious();
//     await TrackPlayer.play();
//   } catch (error) {
//     console.error("Error skipping to previous track:", error);
//   }
// }
// async seekToButton(position: number) {
//   try {
//     await TrackPlayer.seekTo(position);
//   } catch (error) {
//     console.error("Error seeking to position:", error);
//   }
// }
// async getCurrentTrack() {
//   try {
//     const trackIndex = await TrackPlayer.getActiveTrackIndex();

//     const track = await TrackPlayer.getTrack(trackIndex || 0);
//     return track;
//   } catch (error) {
//     console.error("Error getting current track:", error);
//     return null;
//   }
// }

// async addTrack(track:Partial<ISermonTrack>) {
//   console.log(track, "track to add");
//   const url = (track as any).url ?? (track as any).sermon ?? "";
//   const title = track.title ?? "";
//   const artist = (track as any).artist ?? (track as any).minister ?? undefined;
//   const artwork = (track as any).artwork ?? (track as any).image ?? undefined;
//   const duration = typeof track.duration === "number" ? track.duration : undefined;

//   await TrackPlayer.add([
//     {
//       id: String((track as any).id ?? url),
//       url,
//       title,
//       artist,
//       artwork,
//       duration,
//     },
//   ]);
//   await TrackPlayer.setRepeatMode(Rend.Queue);

// };

//   /**
//    * @name play
//    * @description Starts or resumes playback from the current track position.
//    * Updates the global store to reflect the playing state before calling TrackPlayer.
//    *
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to play.
//    * @sideeffect Updates Zustand's `trackPlaying` state and may trigger `onError`.
//    * @example
//    * await player.play();
//    * @access Public
//    */
//   async play() {

//     const store = useTrackStore.getState();

//     const playbackState = (await TrackPlayer.getPlaybackState()).state;
//      if (playbackState === State.Playing) {
//       store.pause(); // optimistic
//       await TrackPlayer.pause();
//       return;
//     }
//     store.play();
//     try {
//       await TrackPlayer.play();
//     } catch (err: any) {
//       store.pause();
//       store.setError(err);
//       this.options.onError?.(err);
//     }
//   }

//   /**
//    * @name pause
//    * @description Pauses playback of the current track. Updates the global store
//    * before attempting to pause via TrackPlayer. If pausing fails, the playing state is restored.
//    *
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to pause.
//    * @sideeffect Updates Zustand's `trackPlaying` state and may trigger `onError`.
//    * @example
//    * await player.pause();
//    * @access Public
//    */
//   async pause() {
//     const store = useTrackStore.getState();
//     store.pause();
//     try {
//       await TrackPlayer.pause();
//     } catch (err: any) {
//       store.play();
//       store.setError(err);
//       this.options.onError?.(err);
//     }
//   }

//   /**
//    * @name togglePlayPause
//    * @description Toggles playback state between playing and paused depending on the
//    * current Zustand store state.
//    *
//    * @returns {Promise<void>} Resolves after playback state has changed.
//    * @example
//    * await player.togglePlayPause();
//    * @access Public
//    */
//   async togglePlayPause() {
//     const playing = useTrackStore.getState().trackPlaying;
//     return playing ? this.pause() : this.play();
//   }

//   /**
//    * @name skipToNext
//    * @description Skips playback to the next track in the queue. If repeat mode is "one",
//    * instead seeks to the beginning of the current track. Ensures playback resumes after skip.
//    *
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to skip or play.
//    * @sideeffect Updates Zustand's current track reference and may trigger `onError`.
//    * @access Public
//    */
//   async skipToNext() {
//     const store = useTrackStore.getState();
//     if (store.repeatMode === "one") return this.seekTo(0);

//     // Only call if function exists
//     store.nextTrack?.();

//     const target = store.currentTrack;
//     if (!target) return;

//     if (typeof target.id === "string") {
//       const idx = await this.findIndexById(target.id);
//       if (idx != null) {
//         await TrackPlayer.skip(idx);
//         await TrackPlayer.play();

//         store.play();
//       }
//     }
//   }

//   /**
//    * @name skipToPrevious
//    * @description Skips playback to the previous track in the queue. If repeat mode is "one",
//    * instead seeks to the beginning of the current track. Ensures playback resumes after skip.
//    *
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to skip or play.
//    * @sideeffect Updates Zustand's current track reference and may trigger `onError`.
//    * @access Public
//    */
//   async skipToPrevious() {
//     const store = useTrackStore.getState();
//     if (store.repeatMode === "one") return this.seekTo(0);

//     store.prevTrack?.();

//     const target = store.currentTrack;
//     if (!target) return;

//     if (typeof target.id === "string") {
//       const idx = await this.findIndexById(target.id);
//       if (idx != null) {
//         await TrackPlayer.skip(idx);
//         await TrackPlayer.play();
//         store.play();
//       }
//     }
//   }

//   /**
//    * @name findIndexById
//    * @description Private helper to locate the index of a track in the current queue
//    * by its ID string.
//    *
//    * @private
//    * @param {string} id - Unique track identifier.
//    * @returns {Promise<number|undefined>} Index if found, otherwise undefined.
//    */
//   private async findIndexById(id: string): Promise<number | undefined> {
//     const q = await TrackPlayer.getQueue();
//     const idx = q.findIndex((t) => t.id === id);
//     return idx >= 0 ? idx : undefined;
//   }

//   /**
//    * @name seekTo
//    * @description Seeks the playback position of the current track to a given number
//    * of seconds from the start.
//    *
//    * @param {number} position - Position in seconds to seek to.
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to seek.
//    * @sideeffect Updates `currentTime` in Zustand store and may trigger `onError`.
//    * @example
//    * await player.seekTo(42); // Jumps to 42 seconds into the track
//    * @access Public
//    */
//   async seekTo(position: number) {
//     const store = useTrackStore.getState();
//     store.seekTo(position);
//     try {
//       await TrackPlayer.seekTo(position);
//     } catch (err: any) {
//       store.setError(err);
//       this.options.onError?.(err);
//     }
//   }

//   /**
//    * @name stop
//    * @description Stops playback and resets the playing state in the store.
//    * TrackPlayer retains the current queue and position unless otherwise cleared.
//    *
//    * @returns {Promise<void>}
//    * @throws {Error} If TrackPlayer fails to stop.
//    * @sideeffect Updates Zustand's `trackPlaying` state and may trigger `onError`.
//    * @example
//    * await player.stop();
//    * @access Public
//    */
//   async stop() {
//     const store = useTrackStore.getState();
//     store.pause();
//     try {
//       await TrackPlayer.stop();
//     } catch (err: any) {
//       store.setError(err);
//       this.options.onError?.(err);
//     }
//   }

//   /**
//    * @name setRepeatMode
//    * @description Updates the repeat mode for playback in the Zustand store.
//    * Supported modes: "off", "one", "all".
//    *
//    * @param {RepeatMode} mode - Desired repeat mode.
//    * @returns {void}
//    * @example
//    * player.setRepeatMode("all");
//    * @access Public
//    */
//   setRepeatMode(mode: RepeatMode) {
//     useTrackStore.setState({ repeatMode: mode });
//   }

//   /**
//    * @name setShuffle
//    * @description Enables or disables shuffle mode in the Zustand store.
//    * Does not immediately reorder the queue — queue randomization should be
//    * implemented separately when enabling shuffle.
//    *
//    * @param {boolean} value - True to enable shuffle, false to disable.
//    * @returns {void}
//    * @example
//    * player.setShuffle(true);
//    * @access Public
//    */
//   setShuffle(value: boolean) {
//     useTrackStore.setState({ shuffle: value });
//   }

//   /**
//    * @name setVolume
//    * @description Sets playback volume for TrackPlayer, clamped between 0.0 (mute) and 1.0 (full volume).
//    * If no volume is provided, it attempts to use the currently set TrackPlayer volume or Zustand store value.
//    * Updates the global track store and applies the change to TrackPlayer. Supports optional debug logging
//    * and analytics tracking to monitor volume changes.
//    *
//    * @param {number} [volume] - Desired volume level between 0 and 1. If omitted, the current volume is used.
//    * @returns {Promise<void>} Resolves when the volume is successfully applied.
//    * @throws {Error} If TrackPlayer fails to set volume.
//    * @sideeffect Updates `volume` in Zustand store, triggers optional `onError`, and logs analytics/debug info.
//    * @example
//    * await player.setVolume(0.8); // Set to 80% volume
//    * await player.setVolume();    // Uses existing volume if available
//    * @see TrackPlayer.setVolume
//    * @access Public
//    */
//   async setVolume(volume?: number) {
//     const store = useTrackStore.getState();
//     try {
//       let v: number;

//       // If a volume is passed, clamp it; otherwise try to use the existing TrackPlayer volume
//       if (typeof volume === "number") {
//         v = Math.max(0, Math.min(volume, 1));
//       } else {
//         const currentVolume = await TrackPlayer.getVolume();
//         v = currentVolume ?? store.volume ?? 0.05; // fallback default
//       }

//       // update store and player
//       useTrackStore.setState({ volume: v });
//       await TrackPlayer.setVolume(v);
//     } catch (err: any) {
//       useTrackStore.setState({ error: err.message });
//       this.options.onError?.(err);
//     }
//   }

//   /**
//    * @name setPlaybackRate
//    * @description Sets the current playback speed for the TrackPlayer.
//    * The value is clamped between 0.5x and 2.0x speed. Updates the global track store
//    * and attempts to apply the new rate to the TrackPlayer instance. If an error occurs,
//    * it is stored in the track store and the optional `onError` callback is triggered.
//    *
//    * @param {number} rate - Desired playback rate in the range 0.5 to 2.0.
//    * @returns {Promise<void>} Resolves when the rate is successfully applied.
//    * @throws {Error} If the TrackPlayer fails to set the rate.
//    * @sideeffect Updates `playbackRate` in `useTrackStore` and may trigger `onError`.
//    * @example
//    * await player.setPlaybackRate(1.5); // Plays 50% faster
//    * @see TrackPlayer.setRate
//    * @see useTrackStore
//    * @access Public
//    */
//   async setPlaybackRate(rate: number) {
//     const r = Math.max(0.5, Math.min(rate, 2));
//     useTrackStore.setState({ playbackRate: r });
//     try {
//       await TrackPlayer.setRate(r);
//     } catch (err: any) {
//       useTrackStore.setState({ error: err });
//       this.options.onError?.(err);
//     }
//   }

// /**
//  * =========================
//  * Bookmarks
//  * =========================
//  * @description Save & restore resume points per track.
//  */
// saveBookmark(trackId: string, position: number) {
//   const { bookmarks } = useTrackStore.getState();
//   useTrackStore.setState({
//     bookmarks: { ...bookmarks, [trackId]: position }
//   });
// }

// restoreBookmark(trackId: string): number | undefined {
//   return useTrackStore.getState().bookmarks?.[trackId];
// }

// /**
//  * =========================
//  * Shuffle & Repeat with persistence
//  * =========================
//  */
// setShufflePersistent(enabled: boolean) {
//   this.setShuffle(enabled);
//   // Save to storage for persistence
//   try {
//     localStorage.setItem("player.shuffle", JSON.stringify(enabled));
//   } catch {}
// }

// setRepeatModePersistent(mode: RepeatMode) {
//   this.setRepeatMode(mode);
//   try {
//     localStorage.setItem("player.repeatMode", mode);
//   } catch {}
// }

// loadPersistentPlaybackPrefs() {
//   try {
//     const shuffle = localStorage.getItem("player.shuffle");
//     const repeatMode = localStorage.getItem("player.repeatMode");
//     if (shuffle !== null) this.setShuffle(JSON.parse(shuffle));
//     if (repeatMode) this.setRepeatMode(repeatMode as RepeatMode);
//   } catch {}
// }

// /**
//  * =========================
//  * Queue Management
//  * =========================
//  */
// async addToQueue(track: Track) {
//   const store = useTrackStore.getState();
//   await TrackPlayer.add(track);
//   store.setQueue([...store.queue, track]);
// }

// async removeFromQueue(trackId: string) {
//   const store = useTrackStore.getState();
//   const queue = await TrackPlayer.getQueue();
//   const idx = queue.findIndex((t) => t.id === trackId);
//   if (idx >= 0) {
//     await TrackPlayer.remove([idx]);
//     store.setQueue(queue.filter((t) => t.id !== trackId));
//   }
// }

// async moveInQueue(fromIndex: number, toIndex: number) {
//   const queue = await TrackPlayer.getQueue();
//   if (
//     fromIndex < 0 ||
//     toIndex < 0 ||
//     fromIndex >= queue.length ||
//     toIndex >= queue.length
//   ) return;
//   const [moved] = queue.splice(fromIndex, 1);
//   queue.splice(toIndex, 0, moved);
//   await TrackPlayer.reset();
//   await TrackPlayer.add(queue);
//   useTrackStore.setState({ queue });
// }

// /**
//  * =========================
//  * Analytics Logging
//  * =========================
//  */
// logAnalytics(eventName: string, payload?: any) {
//   if (this.options.debug) {
//     console.log("[Analytics]", eventName, payload);
//   }
//   this.options.onAnalytics?.(eventName, payload);
// }

// }

// export const usePlayerService = () => {
//   const playerRef = useRef<PlayerService | null>(null);

//   if (playerRef.current === null) {
//     playerRef.current = new PlayerService();
//   }

//   useEffect(() => {
//     return () => {
//       // Clean up the instance when the component unmounts
//       playerRef.current?.destroy();
//     };
//   }, []);

//   return playerRef.current;
// };
