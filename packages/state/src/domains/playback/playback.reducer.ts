import type { PlaybackAction, PlaybackState } from './playback.types';

export function playbackReducer(
    state: PlaybackState,
    action: PlaybackAction,
): PlaybackState {
    switch (action.type) {
        case 'SYNC_PLAYBACK_BRIDGE': {
            const p = action.payload as Partial<PlaybackState>;
            return { ...state, ...p };
        }
        case 'SET_RESUME_POINT': {
            const { trackId, positionMs, durationMs, updatedAt } =
                action.payload as {
                    trackId: string;
                    positionMs: number;
                    durationMs: number;
                    updatedAt: string;
                };
            return {
                ...state,
                resumePoints: {
                    ...state.resumePoints,
                    [trackId]: { positionMs, durationMs, updatedAt },
                },
            };
        }
        default:
            return state;
    }
}
