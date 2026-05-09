import { describe, expect, it } from 'vitest';
import { playbackReducer } from './playback.reducer';
import { playbackInitial } from './playback.seed';

describe('playbackReducer', () => {
    it('merges SYNC_PLAYBACK_BRIDGE payload', () => {
        const next = playbackReducer(playbackInitial, {
            type: 'SYNC_PLAYBACK_BRIDGE',
            payload: { currentTrackId: 't1', isPlaying: true, positionMs: 1200 },
        });
        expect(next.currentTrackId).toBe('t1');
        expect(next.isPlaying).toBe(true);
        expect(next.positionMs).toBe(1200);
    });

    it('sets resume point', () => {
        const next = playbackReducer(playbackInitial, {
            type: 'SET_RESUME_POINT',
            payload: {
                trackId: 't1',
                positionMs: 3000,
                durationMs: 60000,
                updatedAt: '2026-01-01T00:00:00.000Z',
            },
        });
        expect(next.resumePoints.t1?.positionMs).toBe(3000);
    });
});
