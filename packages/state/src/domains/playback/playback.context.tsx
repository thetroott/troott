import { createDomainContext } from '../_shared/createDomain';
import { playbackReducer } from './playback.reducer';
import { playbackInitial } from './playback.seed';
import type { PlaybackAction, PlaybackState } from './playback.types';

const d = createDomainContext<PlaybackState, PlaybackAction>(
    'playback',
    playbackReducer,
    playbackInitial,
);

export const PlaybackProvider = d.Provider;
export const usePlaybackState = d.useState;
export const usePlaybackDispatch = d.useDispatch;
