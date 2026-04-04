import { Capability } from 'react-native-track-player'

export const CAPABILITIES: Capability[] = [
    Capability.Play,
    Capability.Pause,
    Capability.Stop,
    Capability.SeekTo,
    Capability.Skip,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.JumpForward,
    Capability.JumpBackward,
    Capability.PlayFromId,
    Capability.PlayFromSearch,
    Capability.SetRating,
    Capability.Like,
    Capability.Dislike,
    Capability.Bookmark,
]
