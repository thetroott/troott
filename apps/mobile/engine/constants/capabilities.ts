import { PlayerCommand } from "@rntp/player"

/** @deprecated Prefer {@link useUpdateOptions} / {@link setCommands} with {@link RemoteControlConfig}. */
export const CAPABILITIES: PlayerCommand[] = [
	PlayerCommand.PlayPause,
	PlayerCommand.Next,
	PlayerCommand.Previous,
	PlayerCommand.Seek,
	PlayerCommand.Stop,
	PlayerCommand.SkipForward,
	PlayerCommand.SkipBackward,
]
