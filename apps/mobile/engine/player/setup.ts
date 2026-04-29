import TrackPlayer, { type PlayerConfig } from '@rntp/player';

const playerConfig: PlayerConfig = {
    contentType: 'music',
    handleAudioBecomingNoisy: true,
    android: {
        wakeMode: 'local',
        skipSilenceEnabled: false,
        notification: {
            channelId: 'troott-playback',
            channelName: 'Playback',
            smallIcon: 'ic_launcher',
        },
    },
};

/**
 * Initializes @rntp/player. Must run once before other player APIs (v5: synchronous).
 */
export const startPlayerService = async () => {
    try {
        TrackPlayer.setupPlayer(playerConfig);
        return true;
    } catch (error: unknown) {
        const message =
            error && typeof error === 'object' && 'message' in error
                ? String((error as { message: unknown }).message)
                : String(error);
        if (
            message.toLowerCase().includes('already') ||
            message.toLowerCase().includes('twice')
        ) {
            console.warn(
                '[Player] setupPlayer skipped (already initialized):',
                message,
            );
            return true;
        }
        console.error('[Player] setupPlayer error:', error);
        throw error;
    }
};
