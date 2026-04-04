import { Platform } from "react-native";
import TrackPlayer, {
  AndroidAudioContentType,
  IOSCategory,
  IOSCategoryOptions,
} from "react-native-track-player";



  /**
   * Enhanced Android buffer settings for gapless playback
   *
   * @see
   */
  const buffers =
    Platform.OS === 'android'
      ? {
        maxCacheSize: 50 * 1024, // 50MB cache
        maxBuffer: 30, // 30 seconds buffer
        playBuffer: 2.5, // 2.5 seconds play buffer
        backBuffer: 5, // 5 seconds back buffer
      }
      : {}

/**
 * Initializes the TrackPlayer with basic settings and options.
 * This function is called once to set up the player.
 * @name setupPlayer
 * @returns {Promise<boolean>} - Returns true if setup was successful, false otherwise.
 */
const setupPlayer = async (
  options: Parameters<typeof TrackPlayer.setupPlayer>[0]
) => {
  await TrackPlayer.setupPlayer(options);
};

/**
 * Sets up the TrackPlayer service.
 * Note: TrackPlayer.updateOptions and other configurations that require the service
 * to be running are now handled within the background service itself.
 */

export const startPlayerService = async () => {
  try {
    // Only call the basic setup here. The options will be updated inside the background service.
    await setupPlayer({
      autoHandleInterruptions: true,
      iosCategory: IOSCategory.Playback,
      iosCategoryOptions: [IOSCategoryOptions.AllowAirPlay, IOSCategoryOptions.AllowBluetooth],
      androidAudioContentType: AndroidAudioContentType.Music,
      minBuffer: 30, // 30 seconds minimum buffer
      ...buffers,
    });

    // Do not call updateOptions here. RNTP 5.x MusicService.updateOptions can NPE when the
    // service is not fully initialized; the native crash happens before JS .catch() runs.
    // Options (capabilities, progress interval) are applied when we first need them, e.g. when
    // loading a queue or when useUpdateOptions(isFavorite) runs for the current track.

    return true;

  } catch (error: any) {
    // Check if the error is due to the player already being initialized
    const message = error && typeof error.message === "string" ? error.message : String(error);
    if (message.includes("already been initialized")) {
      console.warn("Player already set up");
      
      return true

    } else {
      console.error("Player setup error:", error);
      throw error;
    }
  }
};
