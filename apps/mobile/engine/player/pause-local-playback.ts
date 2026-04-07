import TrackPlayer from "@rntp/player"

export async function pauseLocalPlayback(): Promise<void> {
	TrackPlayer.pause()
}
