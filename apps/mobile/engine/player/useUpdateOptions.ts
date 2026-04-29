import TrackPlayer, {
    PlayerCommand,
    type RemoteControlConfig,
} from '@rntp/player';

const remoteControlConfig: RemoteControlConfig = {
    capabilities: [
        PlayerCommand.PlayPause,
        PlayerCommand.Next,
        PlayerCommand.Previous,
        PlayerCommand.Seek,
        PlayerCommand.Stop,
        PlayerCommand.SkipForward,
        PlayerCommand.SkipBackward,
    ],
    handling: 'hybrid',
    perCommandHandling: {
        [PlayerCommand.Previous]: 'js',
    },
    forwardInterval: 15,
    backwardInterval: 15,
};

/** Apply lock-screen / notification remote commands (v5: {@link TrackPlayer.setCommands}). */
export const useUpdateOptions = async (_isFavorite: boolean) => {
    TrackPlayer.setCommands(remoteControlConfig);
};
