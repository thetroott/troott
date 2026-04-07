/**
 * UI-facing playback state for buttons and full player.
 * Maps v5 {@link PlaybackState} + {@link isPlaying} into a single enum used by legacy components.
 */
export enum UiPlaybackState {
	Playing = "playing",
	Paused = "paused",
	Buffering = "buffering",
	Loading = "loading",
	Ready = "ready",
	Ended = "ended",
	Error = "error",
	None = "none",
}
